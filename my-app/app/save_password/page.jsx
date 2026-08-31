"use client";

import { useState } from "react";

export default function SavePassword() {

    const [website, setWebsite] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(e) {

        e.preventDefault();

        const response = await fetch("/api/save-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                website,
                username,
                password

            })

        });

        const data = await response.json();

        if (response.ok) {

            alert("Password Saved Successfully");

            setWebsite("");
            setUsername("");
            setPassword("");

        }

        else {

            alert(data.message);

        }

    }

    return (

        <div className="min-h-screen bg-slate-900 flex justify-center items-center">

            <form
                onSubmit={handleSubmit}
                className="bg-slate-800 p-10 rounded-xl w-[450px] space-y-5"
            >

                <h1 className="text-3xl text-white font-bold text-center">
                    Save Password
                </h1>

                <input
                    type="text"
                    placeholder="Website"
                    value={website}
                    onChange={(e)=>setWebsite(e.target.value)}
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    required
                />

                <input
                    type="text"
                    placeholder="Username / Email"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded"
                >

                    Save Password

                </button>

            </form>

        </div>

    );

}