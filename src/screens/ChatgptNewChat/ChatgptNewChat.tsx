import {
  ExternalLinkIcon,
  ImageIcon,
  LogOutIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import React from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const ChatgptNewChat = (): JSX.Element => {
  // Data for the sidebar chat history
  const chatHistory = [
    { title: "AI Chat Tool Ethics" },
    { title: "Al Chat Tool Impact Writing" },
    { title: "New chat" },
  ];

  // Data for the sidebar menu options
  const menuOptions = [
    { icon: <TrashIcon className="w-6 h-6" />, title: "Clear conversations" },
    { icon: <SunIcon className="w-6 h-6" />, title: "Light mode" },
    { icon: <UserIcon className="w-6 h-6" />, title: "My  account" },
    { icon: <ExternalLinkIcon className="w-6 h-6" />, title: "Updates & FAQ" },
    { icon: <LogOutIcon className="w-6 h-6" />, title: "Log out" },
  ];

  // Data for the main content categories
  const categories = [
    {
      title: "Examples",
      icon: "/chats.svg",
      items: [
        '"Explain quantum computing insimple terms"',
        '"Got any creative ideas for a 10year old\'s birthday?"',
        '"How do I make an HTTP requestin Javascript?"',
      ],
    },
    {
      title: "Capabilities",
      icon: "/star.svg",
      items: [
        "Remembers what user saidearlier in the conversation.",
        "Allows user to provide follow-up corrections.",
        "Trained to decline inappropriate requests.",
      ],
    },
    {
      title: "Limitations",
      icon: "/shieldwarning.svg",
      items: [
        "May occasionally generate incorrect information.",
        "May occasionally produce harmful instructions or biased content.",
        "Limited knowledge of world andevents after 2021.",
      ],
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[1024px] relative">
        {/* Main content area */}
        <div className="flex flex-col w-[1158px] h-[1024px] items-center gap-4 pt-[260px] pb-0 px-0 absolute top-0 left-[282px]">
          <div className="inline-flex flex-col items-center gap-20 relative">
            {/* ChatGPT Logo and Plus Badge */}
            <div className="inline-flex items-center gap-4 relative">
              <div className="relative w-[220px] h-16">
                <img
                  className="absolute w-16 h-16 top-0 left-0"
                  alt="Chat GPT"
                  src="/chatgpt-1.svg"
                />
                <img
                  className="absolute w-[140px] h-6 top-5 left-20"
                  alt="Chat GPT"
                  src="/chatgpt.svg"
                />
              </div>
              <Badge className="bg-[#c6c7f8] text-black-100 px-1 py-0.5 rounded">
                <span className="font-12-regular text-[12px] leading-[18px] font-normal">
                  Plus
                </span>
              </Badge>
            </div>

            {/* Categories and Cards Grid */}
            <div className="flex flex-wrap w-[920px] items-start gap-[16px_40px] relative">
              {/* Category Headers */}
              {categories.map((category, index) => (
                <div
                  key={`category-${index}`}
                  className="flex flex-col w-[280px] items-center justify-center gap-2 px-0 py-2 relative rounded-2xl"
                >
                  <div className="inline-flex justify-center self-stretch items-center relative rounded-lg">
                    <img
                      className="relative w-8 h-8"
                      alt={category.title}
                      src={category.icon}
                    />
                  </div>
                  <div className="inline-flex flex-col items-start justify-center relative rounded-lg">
                    <h2 className="relative self-stretch mt-[-1.00px] font-18-semibold font-semibold text-[18px] text-[#1c1c1c] leading-[24px]">
                      {category.title}
                    </h2>
                  </div>
                </div>
              ))}

              {/* Category Items */}
              {categories.flatMap((category, categoryIndex) =>
                category.items.map((item, itemIndex) => (
                  <Card
                    key={`item-${categoryIndex}-${itemIndex}`}
                    className="flex flex-col w-[280px] items-start justify-center px-2 py-1 bg-[#f7f9fb] rounded-lg border-0"
                  >
                    <CardContent className="p-0">
                      <p className="relative self-stretch mt-[-1.00px] font-14-regular font-normal text-[14px] text-[#1c1c1c] leading-[20px]">
                        {item}
                      </p>
                    </CardContent>
                  </Card>
                )),
              )}
            </div>
          </div>

          {/* Message Input Area */}
          <div className="flex flex-col w-[1158px] items-center pt-5 pb-10 px-0 absolute top-[908px] left-0 backdrop-blur-[50px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(50px)_brightness(100%)] bg-[linear-gradient(0deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.4)_100%),linear-gradient(0deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.8)_100%)] shadow-BG-blur-100">
            <div className="flex flex-col w-[760px] h-14 items-start justify-center gap-1 px-5 py-4 relative bg-[#f7f9fb] rounded-2xl overflow-hidden">
              <div className="min-h-6 mt-[-2.00px] mb-[-2.00px] flex flex-wrap items-center gap-[8px_8px] relative self-stretch w-full rounded-lg">
                <div className="flex flex-wrap items-center gap-[16px_16px] relative flex-1 grow rounded-lg">
                  <div className="inline-flex flex-wrap items-center gap-[8px_8px] relative rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1 h-auto w-auto"
                    >
                      <MicIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1 h-auto w-auto"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-start justify-center relative flex-1 grow rounded-lg">
                    <Input
                      className="border-0 shadow-none bg-transparent p-0 h-auto font-14-regular text-[#1c1c1c33]"
                      placeholder="Type message"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 h-auto w-auto"
                >
                  <SendIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="inline-flex flex-col h-[1024px] items-start justify-between absolute top-0 left-0 bg-white border-r border-[#1c1c1c1a]">
          {/* Top section with new chat button and history */}
          <div className="flex flex-col w-[282px] items-start gap-1 p-5 relative">
            <Button className="flex items-center justify-center gap-2 px-4 py-2 relative self-stretch w-full bg-[#1c1c1c] rounded-xl text-white">
              <PlusIcon className="w-5 h-5" />
              <span className="font-18-regular font-normal text-[18px] leading-[24px] text-center">
                New chat
              </span>
            </Button>

            {/* Chat history items */}
            {chatHistory.map((chat, index) => (
              <Button
                key={`chat-${index}`}
                variant="ghost"
                className="p-3 flex flex-wrap items-center gap-[8px_8px] relative self-stretch w-full justify-start rounded-lg"
              >
                <div className="flex flex-wrap gap-[12px_12px] flex-1 grow items-center relative rounded-lg">
                  <img
                    className="relative w-6 h-6"
                    alt="Chat text"
                    src="/chattext.svg"
                  />
                  <div className="flex flex-col items-start justify-center relative flex-1 grow rounded-lg">
                    <span className="relative self-stretch mt-[-1.00px] font-14-regular font-normal text-[14px] text-[#1c1c1c] leading-[20px]">
                      {chat.title}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Bottom section with menu options */}
          <div className="flex flex-col w-[282px] items-start gap-1 p-5 relative border-t border-[#1c1c1c1a]">
            {menuOptions.map((option, index) => (
              <Button
                key={`option-${index}`}
                variant="ghost"
                className="p-3 flex flex-wrap items-center gap-[8px_8px] relative self-stretch w-full justify-start rounded-lg"
              >
                <div className="flex flex-wrap gap-[12px_12px] flex-1 grow items-center relative rounded-lg">
                  <div className="inline-flex items-center justify-center relative rounded-lg">
                    {option.icon}
                  </div>
                  <div className="flex flex-col items-start justify-center relative flex-1 grow rounded-lg">
                    <span className="relative self-stretch mt-[-1.00px] font-14-regular font-normal text-[14px] text-[#1c1c1c] leading-[20px]">
                      {option.title}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
