var express = require('express');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
var router = express.Router();
let productModel = require('../schemas/product')

function buildQuery(obj){
  console.log(obj);
  let result = {};
  if(obj.name){
    result.name=new RegExp(obj.name,'i');
  }
  result.price = {};
  if(obj.price){
    if(obj.price.$gte){
      result.price.$gte = obj.price.$gte;
    }else{
      result.price.$gte = 0
    }
    if(obj.price.$lte){
      result.price.$lte = obj.price.$lte;
    }else{
      result.price.$lte = 10000;
    }
    
  }
  return result;
}

router.get('/', async function(req, res, next) {
  

  let products = await productModel.find(buildQuery(req.query));

  res.status(200).send({
    success:true,
    data:products
  });
});
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findById(id);
    res.status(200).send({
      success:true,
      data:product
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:"khong co id phu hop"
    });
  }
});

router.post('/', async function(req, res, next) {
  try {
    let newProduct = new productModel({
      name: req.body.name,
      price:req.body.price,
      quantity: req.body.quantity,
      category:req.body.category
    })
    await newProduct.save();
    res.status(200).send({
      success:true,
      data:newProduct
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});
router.put('/:id', async (req, res) => {
  try {
      let updatedProduct = await productModel.findOneAndUpdate(
          { _id: req.params.id, isDeleted: false }, 
          req.body, 
          { new: true }
      );
      if (!updatedProduct) {
          return res.status(404).json({ 
              success: false, 
              message: 'Sản phẩm không tồn tại' 
          });
      }
      res.status(200).json({ 
          success: true, 
          data: updatedProduct 
      });
  } catch (error) {
      res.status(500).json({ 
          success: false, 
          message: error.message 
      });
  }
});

router.delete('/:id', async (req, res) => {
  try {
      let deletedProduct = await productModel.findOneAndUpdate(
          { _id: req.params.id, isDeleted: false },
          { isDeleted: true }, 
          { new: true }
      );
      if (!deletedProduct) {
          return res.status(404).json({ 
              success: false, 
              message: 'Sản phẩm không tồn tại' 
          });
      }
      res.status(200).json({ 
          success: true, 
          message: 'Sản phẩm đã bị xóa (mềm)', 
          data: deletedProduct 
      });
  } catch (error) {
      res.status(500).json({ 
          success: false, 
          message: error.message 
      });
  }
});
module.exports = router;