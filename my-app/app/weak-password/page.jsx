"use client";

import { useEffect, useState } from "react";

export default function WeakPasswords() {

    const [passwords, setPasswords] = useState([]);

    useEffect(() => {

        getWeakPasswords();

    }, []);

    async function getWeakPasswords() {

        const response = await fetch("/api/weak-passwords");

        const data = await response.json();

        if (data.success) {

            setPasswords(data.passwords);

        }

    }

    return (

        <main className="min-h-screen bg-slate-900 text-white p-10">

            <div className="max-w-5xl mx-auto">

                <div className="bg-slate-800 rounded-3xl p-10 mb-10">

                    <div className="text-6xl mb-5">
                        ⚠️
                    </div>

                    <h1 className="text-4xl font-bold">
                        Weak Passwords
                    </h1>

                    <p className="text-slate-300 mt-3">
                        Passwords that should be changed.
                    </p>

                </div>

                {passwords.length === 0 ? (

                    <div className="bg-green-700 p-8 rounded-3xl text-center">

                        <h2 className="text-2xl font-bold">
                            🎉 No Weak Passwords Found
                        </h2>

                    </div>

                ) : (

                    <div className="space-y-6">

                        {passwords.map((item) => (

                            <div
                                key={item.id}
                                className="bg-slate-800 rounded-2xl p-6 flex justify-between items-center"
                            >

                                <div>

                                    <h2 className="text-xl font-bold">

                                        {item.website}

                                    </h2>

                                    <p className="text-slate-400">

                                        {item.username}

                                    </p>

                                </div>

                                <span className="bg-red-600 px-5 py-2 rounded-full">

                                    Weak

                                </span>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </main>

    );

}