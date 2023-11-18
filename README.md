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
    A[Start] -->|getHello| B[Return 'hello']
    A -->|getDisaster| C[Fetch Disaster Data]
    C --> D[Parse XML to JSON]
    D --> E[Check for Disaster]
    E -->|Disaster Exists| F[Prepare Compensation Data]
    E -->|No Disaster| G[Return Error]
    F -->|Sign Fields| H[Sign and Verify Fields]
    H --> I[Return Signed Data]
    C -->|Error| J[Error in Data Fetching]
    H -->|Error| K[Error in Signing]

    A -->|getCountryCode| L[Fetch Country Code]
    L -->|Error| M[Error in Country Code Fetching]

    A -->|signFields| N[Sign Data]
    N -->|Verify Fields| O[Verify and Return Signature]
    N -->|Error| P[Error in Signing]

```

### API 2

```mermaid
sequenceDiagram
    participant User
    participant API2
    User->>API2: Request Data
    API2->>User: Respond with Data
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
