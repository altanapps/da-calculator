# DA Calculator

## Getting Started

These instructions will guide you through the process of setting up and deploying the application.

### Prerequisites

- Docker installed on your system. You can download Docker from [here](https://www.docker.com/products/docker-desktop).
- An Infura API key. You can get one from [Infura](https://infura.io/).
- A CoinMarketCap API key. You can get one from [CoinMarketCap](https://pro.coinmarketcap.com/).

### Environment Variables

Before deploying the application, you need to set the following environment variables in your Dockerfile:

- `INFURA_API_KEY`: Your Infura API key.
- `COINMARKETCAP_API_KEY`: Your CoinMarketCap API key.

### Editing the Dockerfile

Open the Dockerfile and replace `YOUR_INFURA_API_KEY` and `YOUR_COINMARKETCAP_API_KEY` with your actual API keys.

Example:

```Dockerfile
# Set the environment variables
ENV INFURA_API_KEY="123yourinfuraapikey"
ENV COINMARKETCAP_API_KEY="456yourcoinmarketcapapikey"
```

### Building the Docker Image

To build the Docker image, run the following command in the directory containing your Dockerfile:

```bash
docker build -t your-app-name .
```

Replace `your-app-name` with the name you wish to give your Docker image.

### Running the Docker Container

To run the Docker container, use the following command:

```bash
docker run -p 49000:3000 -d your-app-name
```

This command maps port 49000 of your host to port 3000 of the Docker container.

### Accessing the Application

Once the container is running, you can access the application at:

```
http://localhost:49000
```

Replace `localhost` with the server's IP address if you are running it on a remote server.

## License

Include license information here.
