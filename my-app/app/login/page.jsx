"use client";
import {useState} from "react";
import "./login.css";

export default function LoginPage(){
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");

    async function handleClick(e){
        e.preventDefault();
        try{
            const response=await fetch("/api/login",{
                 method:"POST",
                 headers:{
                    "content-type":"application/json"
                 },
                 body:JSON.stringify({
                    email,
                    password
                 })
            });
            const data = await response.json();

            if(response.ok){

                alert("Login Successful");

                console.log(data);

            }
            else{

                alert(data.message);

            }

        
        }
        catch(err){

            console.log(err);
            alert("Something went wrong.");

        }
    }
    return(
        <>
         <div className="container">
            <form onSubmit={handleClick} className="login-box">
                  <h1>Login</h1>

                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                />

                <button type="submit">

                    Login

                </button>

                <br/><br/>
                    <center>
                    <a href="/signup">

                        Sign Up

                    </a>
                    </center>
               
            </form>
         </div> 
        </>
    );
}