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
    H -->|Error| L[Error in Data Processing]
    J -->|Error| M[Error in Signing Process]

    A -->|signFields| N[Generate Signature]
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

## API 1

### API 1 Overview

API 1 provides...

### Endpoints

- `/endpoint1`: Description of endpoint 1.
- `/endpoint2`: Description of endpoint 2.

## API 2

### API 2 Overview

API 2 provides...

### Endpoints

- `/endpoint3`: Description of endpoint 3.
- `/endpoint4`: Description of endpoint 4.
