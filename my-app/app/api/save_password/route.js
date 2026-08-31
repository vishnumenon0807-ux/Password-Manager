import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request) {

    try {

        const {

            website,
            username,
            password

        } = await request.json();

        await db.query(

            `INSERT INTO passwords
            (website, username, password)
            VALUES($1,$2,$3)`,

            [

                website,
                username,
                password

            ]

        );

        return NextResponse.json({

            success: true,
            message: "Password Saved"

        });

    }

    catch(err){

        console.log(err);

        return NextResponse.json({

            success:false,
            message:"Server Error"

        },
        {
            status:500
        });

    }

}