"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string, method: string = "GET", body?: any) => {
    setLoading(endpoint);
    try {
      const url = `https://gender-healthcare.org${endpoint}`;
      console.log(`Testing ${method} ${url}`);
      
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body && method !== "GET") {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          statusText: response.statusText,
          data: data,
          headers: Object.fromEntries(response.headers.entries()),
        }
      }));
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        [endpoint]: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const commonEndpoints = [
    "/api/appointments",
    "/api/users/me",
    "/api/consultant-profiles",
    "/api/auth/login",
    "/api/services",
    "/api/blogs",
    "/api/menstrual-cycles",
    "/api/sti-test-processes",
    "/api/package-services",
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Common Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commonEndpoints.map((endpoint) => (
                <Button
                  key={endpoint}
                  onClick={() => testEndpoint(endpoint)}
                  disabled={loading === endpoint}
                  className="w-full text-left justify-start"
                  variant="outline"
                >
                  {loading === endpoint ? "Loading..." : `GET ${endpoint}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-endpoint">Endpoint</Label>
                <Input
                  id="custom-endpoint"
                  placeholder="/api/custom-endpoint"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const endpoint = (e.target as HTMLInputElement).value;
                      if (endpoint) testEndpoint(endpoint);
                    }
                  }}
                />
              </div>
              <Button 
                onClick={() => {
                  const input = document.getElementById('custom-endpoint') as HTMLInputElement;
                  if (input?.value) testEndpoint(input.value);
                }}
                className="w-full"
              >
                Test Custom Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]) => (
              <div key={endpoint} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{endpoint}</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Test */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Navigation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/profile/appointments'}
              className="w-full"
            >
              Test Navigation to "Lịch tư vấn của tôi"
            </Button>
            <Button 
              onClick={() => console.log('Current cookies:', document.cookie)}
              className="w-full"
              variant="outline"
            >
              Check Cookies (See Console)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
