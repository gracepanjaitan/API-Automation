const request = require("supertest");
const axios = require("axios");
const chai = require("chai");
const expect = chai.expect;
const fs = require("fs");
require("dotenv").config();
process.env.NODE_DEBUG = "axios";
const BASE_URL = 'https://restful-booker.herokuapp.com';
const bookingData = JSON.parse(
  fs.readFileSync('./data/bookingData.json', "utf-8")
);

const baseUrl = process.env.BASE_URL;
const authEndpoint = `${baseUrl}/auth`;
const bookingEndpoint = `${baseUrl}/booking`;

let bookingId;
let token;
describe("E2E API Test - Booking Flow", function () {
  this.timeout(10000);
  it("Step 1 - Get token via /auth", async () => {
    try {
      const response = await axios.post(authEndpoint, {
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      });
      console.log("Auth Response:", response.data);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("token");

      token = response.data.token;
    } catch (err) {
      console.error("Failed auth response:", err.response?.data || err.message);
      throw err; // biar Mocha tetap fail di sini
    }
  });
  console.log("BASE_URL:", baseUrl);

  it("Step 2 - Create booking via /booking", async () => {
    this.timeout(20000);

    const response = await axios.post(`${BASE_URL}/booking`, bookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property("bookingid");
    expect(response.data).to.have.property("booking");

    bookingId = response.data.bookingid;
    const createdBooking = response.data.booking;

    expect(createdBooking).to.deep.include(bookingData);
  });

  it("Step 3 - Get booking by ID", async () => {
    const response = await axios.get(`${bookingEndpoint}/${bookingId}`);

    expect(response.status).to.equal(200);
    expect(response.data).to.deep.include(bookingData);
  });

  it("Step 4 - Delete booking by ID", async () => {
    const response = await axios.delete(`${bookingEndpoint}/${bookingId}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    expect(response.status).to.equal(201); // sesuai dokumentasi API
  });
});
