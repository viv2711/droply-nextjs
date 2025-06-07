"use client"
import { ThemeProviderProps } from "next-themes";
import { ImageKitProvider } from "imagekitio-next";
import { HeroUIProvider } from "@heroui/react";
export interface ProviderProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const authenticator = async () => {
  try {
    const response = await fetch("api/imagekit-auth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Imagekit Auhthentication Error", error);
    throw error;
  }
};
export function Providers({ children, themeProps }: ProviderProps) {
  return (
    <h1>
      <ImageKitProvider
        authenticator={authenticator}
        publicKey={process.env.NEXT_PUBLIC_IMAGE_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </ImageKitProvider>
    </h1>
  );
}
