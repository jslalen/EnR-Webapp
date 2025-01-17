const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require("../models/order");
const Product = require("../models/product")
const checkAuth = require("../Middleware/check-auth")
// Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
  Order.find()
  .select('product quantity _id ordername rollNo Email mobileno')
  .populate('product','name description quantity dataSheet')
  .exec()
  .then(docs =>{
      res.status(200).json({
          count: docs.length,
          orders: docs.map(doc=> {
              return{
              _id: doc._id,
              product: doc.product,
              quantity: doc.quantity,
              ordername: doc.ordername,
              rollNo: doc.rollNo,
              Email: doc.Email,
              mobileno: doc.mobileno,
          request: {
              type:'GET',
              url: "https://limitless-lowlands-36879.herokuapp.com/orders/"+ doc._id
          }
        }
        }),
      });
  })
  .catch(err=>{
      res.status(500).json({
          error: err
      });
  });
});

router.post('/', checkAuth, (req, res, next) => {
    console.log(req)
    Product.findById(req.body.Order.productId)
    .then(product =>{
        if (!product){
            return res.status(404).json({
                message: "Product not found"
            });
        }
        console.log("entering True")
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.Order.quantity,
            product: req.body.Order.productId,
            ordername: req.body.Order.ordername,
            rollNo: req.body.Order.rollNo,
            Email: req.body.Order.Email,
            mobileno: req.body.Order.mobileno,
        });
        return order.save();
    })
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message:"Order Created",
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
    });

router.get('/:orderId', (req, res, next) => {
  Order.findById(req.params.orderId)
  .populate('product')
  .exec()
  .then(order =>{
      if(!order){
          return res.status(404).json({
              message: "Order not found"
          });
      }
      res.status(200).json({
          order: order,
          request: {
              type: 'GET',
              url: "https://limitless-lowlands-36879.herokuapp.com/orders"
          }
      })
      .catch(err=>{
          res.status(500).json({
              error: err
          });
      });
  });
    });


router.delete('/:orderId', checkAuth,(req, res, next) => {
    Order.remove({_id: req.params.orderId}).exec()
    .then(result=>{
        res.status(200).json({
            message: "Order Deleted",
            request: {
                type: "POST",
                url: "https://limitless-lowlands-36879.herokuapp.com/orders",
                body: {productId: 'ID', quantity:'Number'} 
            }
        })
    })
    .catch(err=>{
        res.status(500).json({
            error: err
        });
    });
    });

module.exports = router;