"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";

interface CustomInputProps {
    route: string;
    iconPosition: string;
    imgSrc: string;
    placeholder: string;
    otherClasses: string;
}

// const LocalSearchBar = ({route, iconPosition, imgSrc, placeholder, otherClasses}: CustomInputProps) => {
const LocalSearchBar = ({ iconPosition, imgSrc, placeholder, otherClasses}: CustomInputProps) => {
    return(<div className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}>
        {iconPosition === "left" && (<Image src={imgSrc} height={24} width={24} alt="search icon"  className="cursor-pointer"/>)}
        <Input type="text" placeholder={placeholder} value="" onChange={() => {}} className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"/>
        {iconPosition === "right" && (<Image src={imgSrc} height={24} width={24} alt="search icon"  className="cursor-pointer"/>)}
    </div>)
}

export default LocalSearchBar;