## Installation

To run the code locally, follow these steps:

### Prerequisites

- Ensure you have **Nodejs** installed. You can download it from [nodejs.org](https://nodejs.org).

### Steps

1. **Clone the repository**:

   ```sh
   git clone https://github.com/Tibz-Dankan/crypto-tennis

   cd crypto-tennis
   ```

1. **Install dependencies**:

   ```sh
   npm install

   ```

1. **Set up environmental variables**:

| Variable    | Type   | Description                             |
| ----------- | ------ | --------------------------------------- |
| `API_TOKEN` | string | Authorization header value of blink api |

create .env file in the root project directory and add the above variable

_Example_

```sh

API_TOKEN=blink_xxxxx

```

4. **Start the application**:

   ```sh

   npm start

   ```

5. **Transfer sats**:

   ```sh

   npm run pay

   ```

   Before running the command to transfer stats, ensure that the server is up and running

   At this point application server should be running and accessible via url **http://localhost:4000/graphql**

> Note: The application server port number is **4000**
