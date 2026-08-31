import { NextResponse } from "next/server";
import db from "@/lib/db";
 export async function POST(request){
    try{
        const {email,password}=await request.json();
        const result=await db.query("SELECT * FROM users WHERE email=$1",[email]);
        if(result.rows.length===0){
            return NextResponse.json({
                success: false,
                message: "User not found"
            },{
                status:404
            });
        }
         const user = result.rows[0];

        if (user.password !== password) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Incorrect Password"
                },
                {
                    status: 401
                }
            );

        }
        return NextResponse.json(
            {
                success: true,
                message: "Login Successful",
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        );
    }
    catch(err){
       console.log(err);

        return NextResponse.json(
            {
                success: false,
                message: "Server Error"
            },
            {
                status: 500
            }
        );

    }
    
 }