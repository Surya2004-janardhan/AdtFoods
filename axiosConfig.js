import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.17.53:3500", // Set your base URL here
});

export default instance;

//    IPv4 Address. . . . . . . . . . . : 192.168.17.53
