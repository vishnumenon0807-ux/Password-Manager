import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function GET() {

    try {

        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            );

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await db.query(

            `SELECT
                id,
                website,
                username,
                password
             FROM passwords
             WHERE user_id=$1
             ORDER BY website ASC`,

            [decoded.id]

        );

        return NextResponse.json({

            success: true,
            passwords: result.rows

        });

    }

    catch(err){

        console.log(err);

        return NextResponse.json(
            {
                success:false,
                message:"Server Error"
            },
            {
                status:500
            }
        );

    }

}