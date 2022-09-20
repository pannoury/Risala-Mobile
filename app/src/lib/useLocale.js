import { useState, useEffect } from "react";

export default function useLocale(){
    const [locale, setLocale] = useState("en")

    //useEffect(() => {
    //    if(Localization.locale){
    //        if(Localization.locale === "en" || Localization.locale === "en-US"){
    //            setLocale("en")
    //        } else {
    //            setLocale("en")
    //        }
    //    } else{
    //        setLocale("en")
    //    }
    //})

    return locale;
}