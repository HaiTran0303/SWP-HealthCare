"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search } from "lucide-react";

interface Question {
  id: string;
  question: string;
  date: string;
  status: "pending" | "answered";
  category: string;
  answer?: {
    text: string;
    advisorName: string;
    advisorAvatar: string;
    answeredOn: string;
  };
}

interface QASectionProps {
  questions?: Question[];
}

export default function QASection({
  questions: propQuestions,
}: QASectionProps) {
  const [activeTab, setActiveTab] = useState("ask");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  // Default questions if none are provided
  const defaultQuestions: Question[] = [
    {
      id: "q1",
      question: "What are the most common symptoms of STIs?",
      date: "2023-10-15",
      status: "answered",
      category: "STI",
      answer: {
        text: "Many STIs can be asymptomatic, but common symptoms include unusual discharge, burning during urination, sores or bumps around genitals, unusual odor, and pain during intercourse. It's important to get tested regularly even without symptoms.",
        advisorName: "Dr. Sarah Johnson",
        advisorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        answeredOn: "2023-10-17",
      },
    },
    {
      id: "q2",
      question: "How effective are different types of contraceptives?",
      date: "2023-10-18",
      status: "answered",
      category: "Contraception",
      answer: {
        text: "Effectiveness varies: hormonal methods like pills (91% typical use) and IUDs (over 99%), barrier methods like condoms (85% typical use), and natural methods like fertility awareness (76-88% typical use). Consult with a healthcare provider to find the best option for your needs.",
        advisorName: "Dr. Michael Chen",
        advisorAvatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        answeredOn: "2023-10-19",
      },
    },
    {
      id: "q3",
      question: "What factors can affect my menstrual cycle regularity?",
      date: "2023-10-20",
      status: "pending",
      category: "Reproductive Health",
    },
  ];

  const [questions, setQuestions] = useState<Question[]>(
    propQuestions || defaultQuestions,
  );

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      question: question,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      category: category,
    };

    setQuestions([newQuestion, ...questions]);
    setQuestion("");
    setActiveTab("my-questions");
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const categories = [
    { value: "general", label: "General" },
    { value: "sti", label: "STI" },
    { value: "contraception", label: "Contraception" },
    { value: "reproductive-health", label: "Reproductive Health" },
    { value: "sexual-wellness", label: "Sexual Wellness" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Ask Our Health Advisors</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have questions about sexual health? Our qualified healthcare advisors
          are here to help. Submit your questions and receive personalized
          answers from medical professionals.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="ask">Ask a Question</TabsTrigger>
          <TabsTrigger value="my-questions">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="ask" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Question</CardTitle>
              <CardDescription>
                Your question will be answered by a qualified healthcare advisor
                within 48 hours.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitQuestion}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">
                    Your Question
                  </label>
                  <Textarea
                    id="question"
                    placeholder="Type your health question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>
                    Your question will be anonymous. Personal information is
                    never shared publicly.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Submit Question
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="my-questions" className="mt-4">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredQuestions.length > 0 ? (
            <div className="space-y-6">
              {filteredQuestions.map((q) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{q.question}</CardTitle>
                        <CardDescription className="mt-1">
                          Asked on {q.date} •{" "}
                          <Badge
                            variant={
                              q.status === "pending" ? "outline" : "secondary"
                            }
                          >
                            {q.status === "pending"
                              ? "Awaiting Answer"
                              : "Answered"}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Badge>{q.category}</Badge>
                    </div>
                  </CardHeader>

                  {q.answer && (
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-md">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={q.answer.advisorAvatar}
                              alt={q.answer.advisorName}
                            />
                            <AvatarFallback>
                              {q.answer.advisorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {q.answer.advisorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Answered on {q.answer.answeredOn}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{q.answer.text}</p>
                      </div>
                    </CardContent>
                  )}

                  {q.status === "pending" && (
                    <CardContent>
                      <div className="bg-muted/30 p-4 rounded-md text-center text-muted-foreground">
                        <p>
                          Your question is being reviewed by our healthcare
                          advisors.
                        </p>
                        <p className="text-sm">
                          You'll receive a notification when it's answered.
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No questions found. Try adjusting your search or ask a new
                question.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab("ask")}
              >
                Ask a Question
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
