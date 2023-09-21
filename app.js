const express=require("express");

const bodyParser=require("body-parser");

const mongoose=require('mongoose');

const app=express();

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rahul:1FrxsbiJaFIxYQui@cluster0.vbjrzxr.mongodb.net/todoListDB");

const itemSchema= {
    item:String
};

const Item =mongoose.model("Item",itemSchema);

const item1= new Item({
    item:"Buy Vegetable"
})
const item2 =new Item({
    item:"Clean the car"
})
const item3=new Item({
    item:"Clean the house"
})

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemSchema]
}

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
    Item.find({}).then(function(results){

       if(results.length === 0){
         Item.insertMany(defaultItems).then(function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Data added successfully");
                
            }
         });
         res.redirect("/");
        
         
        }
         else{
           res.render("list",{ListTitle :"Today",newListItems:results}); 
         }
       
      

    });
  
});

app.get('/:routeName', async (req, res) => {
    const { routeName } = req.params;
    const { data } = req.body;
  
    try {
     
      const existingRoute = await List.findOne({ name: routeName });
  
      if (!existingRoute) 
      {
        //create a new list 
        const list = new List({
            name:routeName,
            items: defaultItems
        });
       
        list.save();
        res.redirect("/" + routeName);
        
       
      } 
     
     
      else 
      {
        res.render("list",{ListTitle : existingRoute.name ,newListItems: existingRoute.items });
      }
    }
    catch(err){
        console.log("Error");
    }
    
    

     
});


app.post("/",function(req,res){
    
    const NewItem = req.body.newitem;
    const listName = req.body.list;

    const item = new Item({
        item:NewItem
    });
    if(listName === "Today"){
        item.save();
        res.redirect("/");
       
    }
    
    else{
        List.findOne({name:listName}).then((foundList) => {
           foundList.items.push(item);
           foundList.save();
           res.redirect("/" + listName);
          
        });
       
        
    }
    

});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName= req.body.listName;

    if(listName === "Today")
    {

        Item.findByIdAndRemove(checkedItemId).then(function(err){
            if(!err){
                console.log("Succesfully deleted the item!!");
                
            }
        });
        res.redirect("/");
    }
    else
    {
       List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((foundList) =>{
         if(foundList){
            res.redirect("/" + listName);
         }
       });
    } 
});

          
app.listen(3000,function(req,res){
    console.log("Server is running on port 3000");
});