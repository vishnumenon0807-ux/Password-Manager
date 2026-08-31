import { NextResponse } from "next/server";
import db from "@/lib/db";

function isWeak(password) {

    if (password.length < 8)
        return true;

    let hasUpper = /[A-Z]/.test(password);
    let hasLower = /[a-z]/.test(password);
    let hasNumber = /\d/.test(password);
    let hasSpecial = /[@$!%*?&]/.test(password);

    let score = 0;

    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    return score < 3;
}

export async function GET() {

    try {

        const result = await db.query(
            "SELECT id, website, username, password FROM passwords"
        );

        const weakPasswords = result.rows.filter((item) =>
            isWeak(item.password)
        );

        return NextResponse.json({
            success: true,
            passwords: weakPasswords,
        });

    } catch (err) {

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
            },
            {
                status: 500,
            }
        );

    }
}