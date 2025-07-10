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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle,
  Clock,
  Home,
  Info,
  MapPin,
  Package,
  Search,
} from "lucide-react";

interface TestService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  availableAt: string[];
}

const STITestingServices = () => {
  const [date, setDate] = useState<Date>();
  const [showResults, setShowResults] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestService | null>(null);
  const [testType, setTestType] = useState<"in-person" | "home-kit">(
    "in-person",
  );

  // Mock data for testing services
  const testServices: TestService[] = [
    {
      id: "1",
      name: "Comprehensive STI Panel",
      description:
        "Complete screening for common STIs including HIV, Chlamydia, Gonorrhea, Syphilis, and Hepatitis",
      price: 250,
      duration: "30 minutes",
      availableAt: ["Clinic", "Home Kit"],
    },
    {
      id: "2",
      name: "HIV & Hepatitis Screening",
      description: "Focused testing for HIV and Hepatitis B & C",
      price: 150,
      duration: "20 minutes",
      availableAt: ["Clinic", "Home Kit"],
    },
    {
      id: "3",
      name: "Chlamydia & Gonorrhea Test",
      description: "Screening for two of the most common STIs",
      price: 120,
      duration: "15 minutes",
      availableAt: ["Clinic", "Home Kit"],
    },
    {
      id: "4",
      name: "HPV Screening",
      description: "Testing for Human Papillomavirus",
      price: 180,
      duration: "20 minutes",
      availableAt: ["Clinic"],
    },
  ];

  const handleBookTest = (test: TestService) => {
    setSelectedTest(test);
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">STI Testing Services</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our facility offers confidential and comprehensive STI testing
          services. Choose between in-person appointments at our clinic or
          convenient home testing kits.
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Available Tests</TabsTrigger>
          <TabsTrigger value="booking">Book a Test</TabsTrigger>
          <TabsTrigger value="results">View Results</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testServices.map((test) => (
              <Card key={test.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{test.name}</CardTitle>
                  <CardDescription>${test.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{test.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock size={16} />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    <span>Available as: {test.availableAt.join(", ")}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleBookTest(test)}
                    className="w-full"
                  >
                    Book This Test
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Book Your STI Test</CardTitle>
              <CardDescription>
                Choose your preferred testing method and schedule an appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Testing Method</Label>
                  <RadioGroup
                    defaultValue="in-person"
                    value={testType}
                    onValueChange={(value) =>
                      setTestType(value as "in-person" | "home-kit")
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label
                        htmlFor="in-person"
                        className="flex items-center gap-2"
                      >
                        <MapPin size={16} /> In-Person at Clinic
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home-kit" id="home-kit" />
                      <Label
                        htmlFor="home-kit"
                        className="flex items-center gap-2"
                      >
                        <Home size={16} /> Home Testing Kit
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Select Test</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a test" />
                    </SelectTrigger>
                    <SelectContent>
                      {testServices
                        .filter(
                          (test) =>
                            testType === "in-person" ||
                            (testType === "home-kit" &&
                              test.availableAt.includes("Home Kit")),
                        )
                        .map((test) => (
                          <SelectItem key={test.id} value={test.id}>
                            {test.name} - ${test.price}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {testType === "in-person" && (
                  <div className="space-y-2">
                    <Label>Appointment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {testType === "in-person" && date && (
                  <div className="space-y-2">
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "9:00 AM",
                        "10:30 AM",
                        "1:00 PM",
                        "2:30 PM",
                        "4:00 PM",
                      ].map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          className="text-center"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {testType === "home-kit" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Delivery Address</Label>
                      <Input placeholder="Street Address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input placeholder="City" />
                      </div>
                      <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input placeholder="Postal Code" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Contact Information</Label>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    className="mb-2"
                  />
                  <Input placeholder="Phone Number" type="tel" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                {testType === "in-person"
                  ? "Confirm Appointment"
                  : "Order Home Kit"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Securely access your test results with your unique reference
                number
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reference Number</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter your reference number" />
                      <Button
                        variant="outline"
                        onClick={() => setShowResults(true)}
                      >
                        <Search size={16} className="mr-2" /> Search
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info
                        size={18}
                        className="text-muted-foreground mt-0.5"
                      />
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Your reference number was provided to you when you
                          booked your test or ordered your home kit.
                        </p>
                        <p className="mt-2">
                          Results are typically available within 2-3 business
                          days for in-person tests and 5-7 days for home testing
                          kits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        Results Ready
                      </p>
                      <p className="text-sm text-green-700">
                        Your test results are available
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Test Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Test Type:</div>
                        <div>Comprehensive STI Panel</div>
                        <div className="text-muted-foreground">
                          Date Collected:
                        </div>
                        <div>June 15, 2023</div>
                        <div className="text-muted-foreground">
                          Date Processed:
                        </div>
                        <div>June 17, 2023</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Results Summary</h3>
                      <div className="space-y-2">
                        {[
                          { test: "HIV", result: "Negative", status: "normal" },
                          {
                            test: "Chlamydia",
                            result: "Negative",
                            status: "normal",
                          },
                          {
                            test: "Gonorrhea",
                            result: "Negative",
                            status: "normal",
                          },
                          {
                            test: "Syphilis",
                            result: "Negative",
                            status: "normal",
                          },
                          {
                            test: "Hepatitis B",
                            result: "Negative",
                            status: "normal",
                          },
                          {
                            test: "Hepatitis C",
                            result: "Negative",
                            status: "normal",
                          },
                        ].map((item) => (
                          <div
                            key={item.test}
                            className="flex justify-between py-2 border-b last:border-0"
                          >
                            <span>{item.test}</span>
                            <span
                              className={
                                item.status === "normal"
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {item.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline">Download PDF Report</Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Schedule Follow-up</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Schedule a Follow-up Consultation
                          </DialogTitle>
                          <DialogDescription>
                            Speak with a healthcare advisor about your test
                            results
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Preferred Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <span>Select a date</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Consultation Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">
                                  Video Call
                                </SelectItem>
                                <SelectItem value="phone">
                                  Phone Call
                                </SelectItem>
                                <SelectItem value="in-person">
                                  In-Person
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Input placeholder="Any specific concerns or questions" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Confirm Booking</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTest && (
        <Dialog
          open={!!selectedTest}
          onOpenChange={() => setSelectedTest(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book {selectedTest.name}</DialogTitle>
              <DialogDescription>{selectedTest.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Price:</span>
                <span>${selectedTest.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Duration:</span>
                <span>{selectedTest.duration}</span>
              </div>
              <div className="space-y-2">
                <Label>Testing Method</Label>
                <RadioGroup
                  defaultValue="in-person"
                  className="flex flex-col space-y-2"
                >
                  {selectedTest.availableAt.includes("Clinic") && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="in-person" id="dialog-in-person" />
                      <Label
                        htmlFor="dialog-in-person"
                        className="flex items-center gap-2"
                      >
                        <MapPin size={16} /> In-Person at Clinic
                      </Label>
                    </div>
                  )}
                  {selectedTest.availableAt.includes("Home Kit") && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home-kit" id="dialog-home-kit" />
                      <Label
                        htmlFor="dialog-home-kit"
                        className="flex items-center gap-2"
                      >
                        <Package size={16} /> Home Testing Kit
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTest(null)}>
                Cancel
              </Button>
              <Button>Continue Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default STITestingServices;
