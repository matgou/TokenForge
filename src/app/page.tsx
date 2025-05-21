
"use client";

import { useState, useEffect } from 'react';
import type { JWK } from 'jose';
import * as jose from 'jose';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Though not directly used, Textarea is primary
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Copy, Award, Download, Loader2, FileKey } from 'lucide-react';

export default function TokenForgePage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [payload, setPayload] = useState<string>('{ "sub": "1234567890", "name": "John Doe", "iat": 1700000000 }');
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isLoadingJwt, setIsLoadingJwt] = useState(false);
  const [isPayloadValid, setIsPayloadValid] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    try {
      JSON.parse(payload);
      setIsPayloadValid(true);
      setError(null);
    } catch (e) {
      setIsPayloadValid(false);
      if (payload.trim() !== "") { // Only show error if payload is not empty and invalid
        setError("Invalid JSON payload.");
      } else {
        setError(null); // Clear error if payload is empty
      }
    }
  }, [payload]);

  const handleGenerateKeys = async () => {
    setIsLoadingKeys(true);
    setError(null);
    setJwt(null);
    try {
      const { publicKey: pubKeyJwk, privateKey: privKeyJwk } = await jose.generateKeyPair('RS256', { extractable: true });
      
      const exportedPubKey = await jose.exportJWK(pubKeyJwk);
      const exportedPrivKey = await jose.exportJWK(privKeyJwk);

      setPublicKey(JSON.stringify(exportedPubKey, null, 2));
      setPrivateKey(JSON.stringify(exportedPrivKey, null, 2));
      toast({ title: "Success", description: "RSA key pair generated." });
    } catch (e) {
      console.error("Key generation error:", e);
      setError("Failed to generate key pair. See console for details.");
      toast({ variant: "destructive", title: "Error", description: "Failed to generate key pair." });
    }
    setIsLoadingKeys(false);
  };

  const handleCopyToClipboard = async (text: string | null, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard", description: `${type} copied.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: `Failed to copy ${type}.` });
    }
  };

  const handleCopyToClipboardPem = async () => {
    if (!privateKey) {
      toast({ variant: "destructive", title: "Error", description: "Private key not available." });
      return;
    }
    try {
      const privateKeyJwk = JSON.parse(privateKey) as JWK;
      const importedPrivateKey = await jose.importJWK(privateKeyJwk, 'RS256');
      const pemKey = await jose.exportPKCS8(importedPrivateKey);
      await navigator.clipboard.writeText(pemKey);
      toast({ title: "Copied to clipboard", description: "Private Key (PEM) copied." });
    } catch (err) {
      console.error("PEM export/copy error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to copy Private Key (PEM). See console for details." });
    }
  };

  const handleGenerateJwt = async () => {
    if (!privateKey || !isPayloadValid || payload.trim() === "") {
      setError("Private key not generated or payload is invalid/empty.");
      toast({ variant: "destructive", title: "Error", description: "Private key not available or payload invalid/empty."});
      return;
    }
    setIsLoadingJwt(true);
    setError(null);
    setJwt(null);
    try {
      const parsedPayload = JSON.parse(payload);
      const privateKeyJwk = JSON.parse(privateKey) as JWK;
      const importedPrivateKey = await jose.importJWK(privateKeyJwk, 'RS256');

      const signedJwt = await new jose.SignJWT(parsedPayload)
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuedAt()
        // .setIssuer('urn:example:issuer') // Optional
        // .setAudience('urn:example:audience') // Optional
        .setExpirationTime('2h') // Default expiration
        .sign(importedPrivateKey);
      
      setJwt(signedJwt);
      toast({ title: "Success", description: "JWT generated." });
    } catch (e: any) {
      console.error("JWT generation error:", e);
      let errorMessage = "Failed to generate JWT.";
      if (e.message) {
        errorMessage += ` ${e.message}`;
      }
      setError(errorMessage + " See console for details.");
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
    setIsLoadingJwt(false);
  };

  const handleDownloadJwt = () => {
    if (!jwt) return;
    const blob = new Blob([jwt], { type: 'application/jwt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'token.jwt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: "JWT file download initiated." });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-primary tracking-tight">TokenForge</h1>
        <p className="text-lg text-muted-foreground mt-2">Your Simple & Secure JWT Token Generator</p>
      </header>

      <div className="w-full max-w-3xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary" />Generate RSA Key Pair</CardTitle>
            <CardDescription>Create a new RSA256 key pair for signing your JWTs. Keys are in JWK format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGenerateKeys} disabled={isLoadingKeys} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoadingKeys ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Generate Key Pair
            </Button>
            {publicKey && (
              <div className="space-y-2">
                <Label htmlFor="publicKey" className="font-semibold">Public Key (JWK)</Label>
                <Textarea id="publicKey" value={publicKey} readOnly rows={5} className="font-mono text-sm bg-muted/50 rounded-md shadow-inner" />
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(publicKey, 'Public Key (JWK)')} className="mt-1">
                  <Copy className="mr-2 h-4 w-4" /> Copy Public Key (JWK)
                </Button>
              </div>
            )}
            {privateKey && (
              <div className="space-y-2">
                <Label htmlFor="privateKey" className="font-semibold">Private Key (JWK)</Label>
                <Textarea id="privateKey" value={privateKey} readOnly rows={8} className="font-mono text-sm bg-muted/50 rounded-md shadow-inner" />
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(privateKey, 'Private Key (JWK)')} disabled={!privateKey}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Private Key (JWK)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboardPem} disabled={!privateKey}>
                    <FileKey className="mr-2 h-4 w-4" /> Copy Private Key (PEM)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">JWT Payload</CardTitle>
            <CardDescription>Enter the JSON data for your JWT payload. Ensure it's valid JSON.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="jwtPayload" className="font-semibold">Payload (JSON format)</Label>
            <Textarea 
              id="jwtPayload" 
              value={payload} 
              onChange={(e) => setPayload(e.target.value)} 
              rows={8} 
              placeholder='{ "sub": "user123", "name": "Jane Doe", "admin": true }'
              className={`font-mono text-sm mt-1 rounded-md shadow-inner ${!isPayloadValid && payload.trim() !== "" ? 'border-destructive focus-visible:ring-destructive' : ''}`} 
            />
            {!isPayloadValid && payload.trim() !== "" && <p className="text-sm text-destructive mt-1">Payload must be valid JSON.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Award className="mr-2 h-6 w-6 text-accent" />Generate & View Token</CardTitle>
            <CardDescription>Generate your JWT using the created private key and payload. The token will be displayed below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateJwt} 
              disabled={!privateKey || !isPayloadValid || payload.trim() === "" || isLoadingJwt} 
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoadingJwt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              Generate JWT
            </Button>
            {jwt && (
              <div className="space-y-2">
                <Label htmlFor="generatedJwt" className="font-semibold">Generated JWT</Label>
                <Textarea id="generatedJwt" value={jwt} readOnly rows={6} className="font-mono text-sm bg-muted/50 break-all rounded-md shadow-inner" />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(jwt, 'JWT')}>
                    <Copy className="mr-2 h-4 w-4" /> Copy JWT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadJwt}>
                    <Download className="mr-2 h-4 w-4" /> Download JWT
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          {error && (
            <CardFooter>
              <p className="text-sm text-destructive">{error}</p>
            </CardFooter>
          )}
        </Card>
      </div>
      <footer className="mt-12 mb-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} TokenForge. All rights reserved.</p>
        <p>Keys are generated and tokens are signed in your browser. No data is sent to any server.</p>
      </footer>
    </div>
  );
}
