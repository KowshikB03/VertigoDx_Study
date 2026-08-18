import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import IntroVideo from "./IntroVideo";

export const dynamic = "force-dynamic";

// Cloudinary intro/explanation video shown right before the demo questionnaire.
// >>> TO CHANGE THE VIDEO: replace the URL below with your Cloudinary link.
const INTRO_VIDEO_URL =
  "https://res.cloudinary.com/djlppkq0b/video/upload/v1787088862/intro-compressed_t22ts1.mp4";

export default async function IntroPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "tester") redirect("/admin");

  return <IntroVideo src={INTRO_VIDEO_URL} />;
}