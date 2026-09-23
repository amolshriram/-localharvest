import Product from '../models/Product.js';
export async function list(req,res,next){ try { const query = { ...(req.query.category ? { category:req.query.category } : {}), ...(req.query.search ? { name:{ $regex:req.query.search, $options:'i' } } : {}), available:true }; res.json({ success:true, products:await Product.find(query).sort({ createdAt:-1 }) }); } catch(e){next(e);} }
export async function get(req,res,next){ try { const product=await Product.findById(req.params.id); if(!product)return res.status(404).json({success:false,message:'Product not found'}); res.json({success:true,product}); }catch(e){next(e);} }
export async function create(req,res,next){try{res.status(201).json({success:true,product:await Product.create(req.body)});}catch(e){next(e);}}
