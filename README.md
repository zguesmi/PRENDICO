# Project Overview

This document provides an overview of the project architecture and components.

## System Components

### Protokit App Chain

```mermaid
classDiagram
    class Compensation {
        <<module>> 
        disasterOraclePublicKey: State<PublicKey>
        phoneOraclePublicKey: State<PublicKey>
        nullifiers: StateMap<Field, Bool>
        + setAdmin(rndAddrr: PublicKey)
        + changeAdmin(newAdmin: PublicKey)
        + setupPublicKeys(disasterOraclePublicKey: PublicKey, phoneOraclePublicKey: PublicKey)
        + claim(compensationProof: CompensationProof)
    }
    class CompensationProof {
        <<module>> 
        publicOutput: CompensationPublicOutput
        verify()
    }
    
    class Balances {
        <<module>> 
        balances: StateMap<PublicKey, UInt64>
        circulatingSupply: State<UInt64>
        + addBalance(address: PublicKey, amount: UInt64)
    }
    class Admin {
        <<module>> 
        admin: State<PublicKey>
        + setAdmin()
        + OnlyAdmin()
        + changeAdmin(newAdmin: PublicKey)
    }
   
    Compensation --|> CompensationProof
    Compensation --|> Balances
    Compensation --|> Admin
```

### Disaster API 

```mermaid
graph TD
    A[Start getDisaster] --> B[Fetch Disaster Data]
    B -->|Error| Z[Handle Fetch Error]
    B --> C[Parse XML to JSON]
    B --> G[Call getCountryCode]
    C -->|Error| Y[Handle Parse Error]
    C --> D[Check for Disaster]
    D -->|Disaster Exists| E[Prepare Compensation Data]
    D -->|No Disaster| F[Return No Disaster Error]
    G -->|Error| X[Handle Country Code Error]
    G --> H[Call signFields]
    H -->|Error| W[Handle Signing Error]
    H --> I[Return Signed Data]

```

### Phone Number api

```mermaid
graph TD
    A[Start] -->|getVerificationCode| C[Generate Challenge Code]
    C --> D[Store Code with Phone Number]
    D --> E[Return Challenge Code]
    C -->|Error| F[Error in Challenge Code Generation]

    A -->|verifyCode| G[Find Phone Number with Code]
    G -->|Matching Phone Number| H[Prepare Fields for Signing]
    G -->|No Matching Phone Number| I[Return Phone Number Error]
    H --> J[Call signFields]
    J --> K[Return Signed Data]
    J -->|Error| L[Error in Signing Process]
    H -->|Error| M[Error in Data Processing]

    J --> N[signFields: Generate Signature]
    N -->|Verify Signature| O[Verify and Return Signature]
    N -->|Error| P[Error in Signature Generation]


```

### Web/Mobile App

```mermaid
sequenceDiagram
    participant User
    participant WebMobileApp
    User->>WebMobileApp: Interact with App
    WebMobileApp->>User: Display Content
```

### Interaction Between Components

```mermaid
sequenceDiagram
    participant ProtokitAppChain
    participant API1
    participant API2
    participant WebMobileApp

    User->>ProtokitAppChain: User Interaction
    ProtokitAppChain->>API1: Request Data
    ProtokitAppChain->>API2: Request Data
    API1->>ProtokitAppChain: Respond with Data
    API2->>ProtokitAppChain: Respond with Data
    ProtokitAppChain->>WebMobileApp: Provide Data
    WebMobileApp->>User: Display Data
```

## Disaster API Overview

The Disaster API, built with NestJS, provides disaster-related responses and potential compensation based on the user's location. It fetches disaster data from external sources and uses cryptographic methods for secure responses.

### Endpoints

- **`GET /disaster`**: Determines if a user is in a disaster-affected region using their IP and session ID. It fetches external disaster data, verifies against set criteria, and returns a digitally-signed response.

### Core Functions

- **`getDisaster`**: Checks for disasters in the user's location, prepares a response with session and disaster details, and signs it for security.
- **`getCountryCode`**: Retrieves the user's country from their IP address.
- **`signFields`**: Generates a digital signature for the response, ensuring data integrity and authenticity.

## Phone API Overview

The Phone API, created with NestJS, manages phone number verification and authentication.

### Endpoints

- **`GET /verificationcode`**: Initiates phone verification by generating and storing a challenge code for a given phone number.
- **`GET /verifycode`**: Verifies the received challenge code against the stored one, and generates a signed response for successful matches.

### Core Functions

- **`getVerificationCode`**: Generates a verification code for a phone number.
- **`verifyCode`**: Checks the verification code and returns a signed response upon successful validation.
- **`signFields`**: Creates a digital signature using the user's session data and Mina Signer client.