"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const plan = {
  id: "premium",
  name: "Premium",
  price: "Free",
  description: "Full access to all features - No payment required!",
  features: [
    "Unlimited meetings per month",
    "Unlimited AI chat messages per day",
    "Meeting transcripts and summaries",
    "Action items extraction",
    "Email Notifications",
    "All Integrations (Slack, Jira, Asana, Trello)",
    "Priority Support",
  ],
  popular: true,
};

function Pricing() {

  return (
    <div className="container mx-auto px-6 2xl:max-w-[1400px] py-16">
      <div className="max-w-2xl mx-auto text-center mb-14">
        <h2 className="text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-6">
          Our{" "}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600  bg-clip-text text-transparent">
            Plan
          </span>
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-8 bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(156,163,175,0.3)]">
          Automatic summaries, action items, and intelligent insights for every
          meeting. Never miss important details again - completely free!
        </p>
      </div>

      <div className="mt-12 flex justify-center">
        <Card className="relative overflow-visible flex flex-col max-w-md w-full border-blue-500">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white">
            Free Forever
          </Badge>

          <CardHeader className="text-center pb-2">
            <CardTitle className="mb-7">{plan.name}</CardTitle>
            <span className="font-bold text-5xl">{plan.price}</span>
          </CardHeader>

          <CardDescription className="text-center w-11/12 mx-auto">
            {plan.description}
          </CardDescription>

          <CardContent className="flex-1">
            <ul className="mt-7 space-y-2.5 text-sm">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex space-x-2">
                  <Check className="flex-shrink-0 mt-0.5 h-4 w-4" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 hover:scale-[0.98] transition-all duration-150"
              variant="default"
              onClick={() => window.location.href = "/home"}
            >
              Get Started Free
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Pricing;
