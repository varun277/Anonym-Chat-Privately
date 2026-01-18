'use client";';

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

export const useUsername = () => {
  // State to hold the user name
  const [userName, setUserName] = useState("");
  // Generate user name
  const generateUserName = () => {
    const ANIMALS = [
      "lion",
      "tiger",
      "bear",
      "wolf",
      "eagle",
      "shark",
      "panther",
      "fox",
      "owl",
      "rabbit",
    ];
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]; // Random Animal
    return `anonymous-${randomAnimal}-${nanoid(4)}`;
  };

  useEffect(() => {
    const currentUser = localStorage.getItem("username");
    if (currentUser) {
      setUserName(currentUser);
      return;
    }
    // If not available in local storage, generate a new one
    const generatedUserName = generateUserName();
    localStorage.setItem("username", generatedUserName);
    setUserName(generatedUserName);
  }, []);

  return { userName };
};
