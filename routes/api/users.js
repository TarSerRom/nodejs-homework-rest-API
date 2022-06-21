const express = require("express");
const router = express.Router();
const {Conflict, BadRequest, Unathorized, NotFound} = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
var Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const {User, joiLoginSchema, joiUpdateSchema, joiRegisterSchema} = require("../../models/user");
const {authentificate, upload} = require("../../middlewares");

const {SECRET_KEY, PORT} = process.env;
const sendEmail = require("../../helpers/sendEmail");

const avatarDir = path.join(__dirname, "../../", "public", "avatars");

router.post("/signup", async(req, res, next) => {
    try{
        const {error} = joiRegisterSchema.validate(req.body);
        if(error) {
            throw new BadRequest(error.message);
        }
        const {email, password, subscription} = req.body;
        const user = await User.findOne({email});
        if(user){
            throw new Conflict("Email is use");
        }
        const avatarURL = gravatar.url(email);
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const verificationToken = uuidv4();
        const newUser = await User.create({
            email,
            subscription,
            password: hashPassword,
            verificationToken,
            avatarURL,
        });
        const mail = {
            to: email,
            subject: "Email confirmation",
            html: `<a target="_blank" href="http://localhost:${PORT}/api/users/verify/${verificationToken}" >Email confirmation</a>`
          }

          await sendEmail(mail);

        res.status(201).json({
            user: {email: newUser.email, subscription: newUser.subscription},
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try{
        const {error} = joiLoginSchema.validate(req.body);
        if (error) {
            throw new BadRequest(error.message);
        }
        const {email, password} = req.body;
        const user = await  User.findOne({email});
        if(!user) {
            throw new Unathorized("Email or password is wrong");
        }
        if(!user.verify) {
            throw new Unathorized("Email is not verify")
        }
        const passwordCompared = await bcrypt.compare(password, user.password);
        if(!passwordCompared) {
            throw new Unathorized("Email or password is wrong");
        }
        const {subscription, _id} = user;
        const payload = {id: _id};
        const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "1hr"});

        await User.findByIdAndUpdate(_id, {token});

        res.json({
            token, 
            user: {
            email,
            subscription
        },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/current", authentificate, async (req, res, next) => {
    const { email, subscription } = req.user;
    res.json({
      user: {
        email,
        subscription,
      },
    });
  });

router.get("/logout", authentificate, async(reg, res) => {
    const _id = req.user;
    await User.findByIdAndUpdate(_id, {token: null});
    res.status(204).send();
});

router.patch("/", authentificate, async (reg, res, next) => {
    try{
        const {error} = joiUpdateSchema.validate(req.body);
        if(error) {
            throw new BadRequest(error.message);
        }

        const {_id} = req.user;
        const {subscription} = req.body;
        const updateSub = await User.findByIdAndUpdate(
            _id,
            {subscription},
            {
                new: true,
            }
        );
        res.json(updateSub);
    } catch (error) {
        next(error);
    }
});

router.patch("/avatars", authentificate, upload.single("avatar"), async (req, res)=>{
    const {path: tempUpload, filename} = req.file;

    const image = await Jimp.read(tempUpload);
    await image.resize(250,250);
    await image.writeAsync(tempUpload);

    const [extention] = filename.split(".").reverse();
    const newFileName = `${req.user._id}.${extention}`;
    const fileUpload = path.join(avatarDir, newFileName);
    await fs.rename(tempUpload, fileUpload);

    const avatarURL = path.join("avatars", newFileName);
    await User.findByIdAndUpdate(req.user._id, {avatarURL}, {new:true});

    res.json({avatarURL});
});

router.get("/verify/:verificationToken", async (req, res, next) => {
    try {
        const {verificationToken} = req.params;
        const user = await User.findOne({verificationToken});
        if(!user) {
            throw new NotFound ("User is not found");
        }
        await User.findByIdAndUpdate(user._id, {
            verificationToken: null,
            verify: true,
        });
        res.json({
            message:"Verification was successful",
        });
    } catch (error) {
        next(error);
    }
});

router.post("/verify", async (req, res, next) => {
    try {
        const {email} = req.body;
        if(!email) {
            throw new BadRequest ("missing required field email");
        }
        const user = User.findOne({email});
        if(!user) {
            throw new NotFound("User is not found");
        }
        if(user.verify) {
            throw new BadRequest("Verification has already been passed");
        }
        const {verificationToken} = user;
        const mail = {
            to: email,
            subject: "Email confirmation",
            html: `<a target="_blank" href="http://localhost:${PORT}/api/users/verify/${verificationToken}" >Email confirmation</a>`
          }
        
          await sendEmail(mail);
          res.json({message: "Verification has been sent"})
    } catch (error) {
        next(error);
    }
})

module.exports = router;