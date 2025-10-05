import {Webhook} from "svix";
import User from "../models/User.js";



//API Controller Function to Manage Clerk User with database

export const clerkWebhooks = async(req,res)=>{
    try{


        const payload = req.body.toString(); // raw buffer → string
        const whook = new Webhook(process.env._CLERK_SECRET);

    // Verify webhook signature
    await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // Parse the JSON payload after verification
    const event = JSON.parse(payload);
     const { data, type } = event;



        // const whook = new Webhook(process.env._CLERK_SECRET);
        // await whook.verify(JSON.stringify(req.body),{
        //     "svix-id":req.headers["svix-id"],
        //     "svix-timestamp":req.headers["svix-timestamp"],
        //     "svix-signature":req.headers["svix-signature"]
        // })

        // const {data,type} = req.body;
        switch(type){
            case 'user.created':{
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: (data.first_name || "" )+ " "+(data.last_name || ""),
                    imageUrl: data.image_url,

                }
                await User.create(userData)
                res.json({})

                    break;
                
            }

            case 'user.updated':{
                const userData = {
                    _id:data.id,
                    email:data.email_addresses[0].email_address,
                    name:data.first_name+" "+ data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id,userData,{ new: true, runValidators: true })
                res.json({})
                break;

            }
            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }

            default:
                res.json({ success: true, message: "Unhandled event type" });
                break;

    
            
        }


    }catch(error){
        console.log("webhook error", error.message);
        res.status(500).json({ success: false, message: error.message });

        // res.json({success:false,message:error.message});


    }


}