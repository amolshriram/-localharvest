import jwt from 'jsonwebtoken';
import User from '../models/User.js';
function token(user) { return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function safe(user) { const value = user.toObject(); delete value.password; return value; }
export async function register(req,res,next) { try { const { name,email,phone,password,address,latitude=17.385,longitude=78.486 } = req.body; if (await User.findOne({ email })) return res.status(409).json({ success:false, message:'Email already registered' }); const user = await User.create({ name,email,phone,password,address,latitude,longitude,role:'customer' }); res.status(201).json({ success:true, token:token(user), user:safe(user) }); } catch(e){ next(e); } }
export async function login(req,res,next) { try { const user = await User.findOne({ email:req.body.email }).select('+password'); if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ success:false,message:'Invalid email or password' }); res.json({ success:true,token:token(user),user:safe(user) }); } catch(e){ next(e); } }
export async function me(req,res){ res.json({ success:true,user:req.user }); }
