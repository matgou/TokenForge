# TokenForge - JWT Generator

TokenForge is a client-side web application built with Next.js that allows users to easily generate RSA key pairs (in JWK and PEM formats), import existing RSA private keys (in JWK format), and create JSON Web Tokens (JWTs) signed with these keys. All cryptographic operations are performed directly in the browser, ensuring that your private keys never leave your machine.

## Features

- **RSA Key Pair Generation**: Generate RS256 public/private key pairs.
  - View keys in both JWK (JSON Web Key) and PEM formats.
  - Copy keys to the clipboard.
- **Private Key Import**: Import an existing RSA private key in JWK format.
  - The corresponding public key is automatically derived and displayed.
  - Supports copying imported private key and derived public key in both JWK and PEM formats.
- **JWT Generation**:
  - Define a custom JSON payload for your JWT.
  - Generate a signed JWT using the active (generated or imported) private key.
  - Set common JWT claims like `iat` (issued at) and `exp` (expiration time - defaults to 2 hours from issuance).
  - Copy the generated JWT to the clipboard.
  - Download the JWT as a `.jwt` file.
- **Client-Side Operations**: All key generation, import, and token signing processes occur entirely within your browser. No sensitive data is transmitted to any server.
- **User-Friendly Interface**: Clean and intuitive UI built with ShadCN UI components and Tailwind CSS.
- **Error Handling & Validation**: Provides feedback for invalid JSON payloads and invalid private key formats during import.
- **Toast Notifications**: Clear notifications for successful operations and errors.

## How to Use

1.  **Generate or Import Keys**:
    *   **Generate New Keys**: Click the "Generate Key Pair" button. The public and private keys (JWK and PEM) will be displayed.
    *   **Import Existing Key**: Paste your private key in JWK format into the "Import Private Key" section and click "Import Private Key".
2.  **Define JWT Payload**:
    *   Enter your desired JSON payload in the "JWT Payload" text area. Ensure it's valid JSON.
3.  **Generate JWT**:
    *   Once you have an active private key (either generated or imported) and a valid payload, click the "Generate JWT" button.
4.  **Use Your Token**:
    *   The generated JWT will appear. You can copy it or download it.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Cryptography**: [jose](https://github.com/panva/jose) (for JWT and JWK operations)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Geist Sans, Geist Mono
- **Toast Notifications**: Custom hook based on react-hot-toast principles.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
