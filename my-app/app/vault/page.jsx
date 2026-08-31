"use client";

import { useEffect, useState } from "react";

export default function Vault() {

    const [passwords, setPasswords] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadPasswords();

    }, []);

    async function loadPasswords() {

        const response = await fetch("/api/vault");

        const data = await response.json();

        if(data.success){

            setPasswords(data.passwords);

        }

        setLoading(false);

    }

    return(

        <main className="min-h-screen bg-slate-950 text-white">

            <div className="max-w-6xl mx-auto p-10">

                <h1 className="text-5xl font-bold mb-2">

                    Password Vault

                </h1>

                <p className="text-slate-400 mb-10">

                    Manage all your saved passwords securely.

                </p>

                {

                    loading ?

                    <h2>Loading...</h2>

                    :

                    passwords.length===0 ?

                    <div className="bg-slate-800 rounded-3xl p-12 text-center">

                        <h2 className="text-3xl font-bold">

                            No Passwords Saved

                        </h2>

                    </div>

                    :

                    <div className="grid gap-6">

                        {

                            passwords.map((item)=>(

                                <PasswordCard
                                    key={item.id}
                                    password={item}
                                />

                            ))

                        }

                    </div>

                }

            </div>

        </main>

    );

}