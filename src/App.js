import React, { useState, useEffect } from "react";
import "./App.css";
import { jsPDF } from "jspdf";

import Re from "./assets/re.png";
import Sign from "./assets/sign.jpeg";
import Header from "./assets/header.png";

import InvoiceDate from "./utils/InvoiceDate";
import InWords from "./utils/InWords";
import prices from "./utils/prices";

function App() {
  useEffect(() => {
    // setInterval(function () {
    dataExporter();
    // }, 5000);
  }, []);

  const [formData, setData] = useState([]);
  const [mobNumber, setMobNumber] = useState("");
  const [selStud, setSelStud] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [recvamt, setRecvamt] = useState(0.0);
  const [search, setSearch] = useState(false);
  const [INV, SetINV] = useState(0);

  async function dataFetcher() {
    const res = await fetch(process.env.REACT_APP_GSHEETS_URL);
    const data = await res.json();
    return data;
  }

  function dataExporter() {
    return dataFetcher().then((res) => setData(res["values"]));
  }

  let orderArr = [];

  for (let i = 1; i < formData.length; i++) {
    let orderDetails = String(formData[i]).split(",");
    orderArr.push(orderDetails);
  }

  let filteredOrders = [];

  function dataDisplay() {
    for (let i = 0; i < orderArr.length; i++) {
      if (mobNumber === orderArr[i][4]) {
        filteredOrders.push(orderArr[i]);
      }
    }
  }

  dataDisplay();

  const numberHandler = (e) => {
    setMobNumber(e.target.value);
  };

  const amountHandler = (e) => {
    setRecvamt(e.target.value);
  };

  let currKey = "";
  let currIndex;
  let IN;
  let counter = 1;
  let itemsplit = [];
  let columnsplit = [];
  let finalItems = [];

  let len = 0;
  let subtotal = 0.0;
  let gst5Total = 0;
  let gst12Total = 0;

  const confirmHandler = () => {
    let p = prompt("Are you sure you want to confirm this order?");
    if (p.toLocaleLowerCase() === "y" || p.toLocaleLowerCase() === "yes") {
      let orderDetails = {
        parent_number: mobNumber,
        student_name:
          filteredOrders[selStud] != "" ? filteredOrders[selStud][1] : "",
        going_to_class:
          filteredOrders[selStud][3] != ""
            ? filteredOrders[selStud][3]
            : filteredOrders[selStud][9] != ""
            ? filteredOrders[selStud][9]
            : filteredOrders[selStud][55],

        bill_amt: Math.round(subtotal + gst5Total + gst12Total),
        paid_amt: recvamt,
        balance: Math.round(subtotal + gst5Total + gst12Total) - recvamt,
        items: finalItems,
        student_gender: filteredOrders[selStud][6],
        email: filteredOrders[selStud][7],
      };

      PushOrderToDB(orderDetails);
      setConfirmed(true);
    }
  };

  const invoiceDownloader = () => {
    let element = document.getElementById("contents");
    let b = document.getElementById("remBalance");
    b.style.display = "none";
    let h = document.getElementById("header");
    h.classList.remove("useless");

    let doc = new jsPDF();
    doc.html(element, {
      callback: function (doc) {
        doc.save(`INVOICE #${INV}.pdf`);
      },
      margin: [10, 0, 0, 20],
      autoPaging: "text",
      x: 0,
      y: 0,
      width: 175,
      windowWidth: 1000,
    });
  };

  async function PushOrderToDB(order_details) {
    const res = await fetch(process.env.REACT_APP_FIREBASE_URL, {
      method: "POST",
      body: JSON.stringify(order_details),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    currKey = data["name"];
    // console.log("pushed1");

    const res1 = await fetch(process.env.REACT_APP_FIREBASE_URL);
    // console.log("fetching");
    const data1 = await res1.json().then((res) => {
      // console.log("fetching 2");
      let x = Object.keys(res);
      for (let i = 0; i < x.length; i++) {
        // console.log(x[i] + " : " + currKey);
        if (x[i] === currKey) {
          // console.log("curr", currKey);
          currIndex = i;

          break;
        }
      }
    });
    // console.log("fetched", currIndex);
    IN = 500 + currIndex;

    let modDetails = {
      parent_number: mobNumber,
      student_name:
        filteredOrders[selStud] != "" ? filteredOrders[selStud][1] : "",
      going_to_class:
        filteredOrders[selStud][3] != ""
          ? filteredOrders[selStud][3]
          : filteredOrders[selStud][9] != ""
          ? filteredOrders[selStud][9]
          : filteredOrders[selStud][55],

      bill_amt: Math.round(subtotal + gst5Total + gst12Total),
      paid_amt: recvamt,
      balance: Math.round(subtotal + gst5Total + gst12Total) - recvamt,
      items: finalItems,
      student_gender: filteredOrders[selStud][6],
      email: filteredOrders[selStud][7],
      invoice_number: IN,
    };

    const res2 = await fetch(process.env.REACT_APP_FIREBASE_URL2, {
      method: "POST",
      body: JSON.stringify(modDetails),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data2 = await res2.json();
    // console.log("pushed2");
    SetINV(IN);
  }

  // console.log("IN::", INV);

  return (
    <>
      <div className="form">
        <label className="form_item" htmlFor="ph">
          Enter Parent's Number
        </label>
        <br />
        <input
          className="form_item text"
          type="text"
          id="ph"
          name="ph"
          onChange={numberHandler}
        />
        <br />
        <button className="button search" onClick={() => setSearch(true)}>
          Click here to search
        </button>
      </div>

      {search ? (
        <div>
          <div>
            <table className="table student_details" id="student_details">
              <tr>
                <th>Student Name</th>
                <th>Current Class</th>
                <th>Going to Class</th>
                <th>Gender</th>
                <th>Parent's No.</th>
                <th>Email</th>
                <th>Select Student</th>
              </tr>
              {/* Select the order you want to confirm */}
              {filteredOrders != 0
                ? filteredOrders.map((item, index) => (
                    <tr>
                      <td key={index}>{item[1]}</td>
                      <td>
                        {item[2] != ""
                          ? item[2]
                          : item[8] != ""
                          ? item[8]
                          : item[54]}
                      </td>
                      <td>
                        {item[3] != ""
                          ? item[3]
                          : item[9] != ""
                          ? item[9]
                          : item[55]}
                      </td>

                      <td key={index}>{item[6]}</td>
                      <td key={index}>
                        {item[4] === item[5] ? item[5] : "Number Mismatch"}
                      </td>
                      <td key={index}>{item[7]}</td>
                      <td>
                        <div className="radio">
                          <input
                            type="radio"
                            name="select student"
                            onChange={() => setSelStud(index)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                : ""}
            </table>
          </div>

          <div>
            {/* Display Order Details */}
            <div id="contents">
              <img
                src={Header}
                alt="header"
                className="header useless"
                id="header"
              />

              <div className="billto">
                <div className="left left_bill">
                  <p class="date bold">Invoice No.: {INV}</p>
                  <p className="bold">BILL TO</p>

                  <p>
                    {filteredOrders[selStud] != ""
                      ? filteredOrders[selStud][1]
                      : ""}
                  </p>
                  <p>
                    Going to Class:{" "}
                    {filteredOrders[selStud][3] != ""
                      ? filteredOrders[selStud][3]
                      : filteredOrders[selStud][9] != ""
                      ? filteredOrders[selStud][9]
                      : filteredOrders[selStud][55]}
                  </p>

                  <p>Bangalore</p>
                </div>
                <div className="right right_bill">
                  <InvoiceDate />
                </div>
              </div>

              <table className="table order_details" id="contentsTable">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders != 0
                    ? filteredOrders[selStud].map((item, index, elements) => (
                        <>
                          <span className="useless">
                            {item > 9 && item !== "" ? len++ : ""}
                          </span>
                          {index <= 9 || index === 54 || index === 55 ? (
                            ""
                          ) : (
                            <>
                              {item !== "" ? (
                                <>
                                  {
                                    <span className="useless">
                                      {
                                        (columnsplit =
                                          formData[0][index].split(" "))
                                      }
                                      {(itemsplit = item.split(" "))}
                                    </span>
                                  }
                                  {counter % 2 !== 0 ? (
                                    <>
                                      {formData[0][index].includes("Tie") ||
                                      formData[0][index].includes("tie") ||
                                      formData[0][index].includes("Belt") ? (
                                        <>
                                          <tr>
                                            <td key={index}>
                                              {formData[0][index]}
                                            </td>
                                            <td key={index}>-</td>
                                            <td key={index}>{item}</td>

                                            {/* Tie Long Price for S14 and S512 ✅*/}
                                            {formData[0][index].includes(
                                              "Tie"
                                            ) &&
                                            formData[0][index].includes(
                                              "S512"
                                            ) ? (
                                              <>
                                                <span className="useless">
                                                  {finalItems.push({
                                                    name: formData[0][index],
                                                    qty: item,
                                                    size: "-",
                                                  })}
                                                </span>
                                                <td key={index}>
                                                  {prices.TieS512}
                                                </td>
                                                <td key={index}>
                                                  {item * prices.TieS512}
                                                </td>
                                                <p className="useless">
                                                  {
                                                    (gst5Total +=
                                                      0.05 *
                                                      (item * prices.TieS512))
                                                  }
                                                </p>

                                                <p className="useless">
                                                  {
                                                    (subtotal +=
                                                      item * prices.TieS512)
                                                  }
                                                </p>
                                              </>
                                            ) : (
                                              <>
                                                {(formData[0][index].includes(
                                                  "Tie"
                                                ) &&
                                                  formData[0][index].includes(
                                                    "M14"
                                                  )) ||
                                                (formData[0][index].includes(
                                                  "Tie"
                                                ) &&
                                                  formData[0][index].includes(
                                                    "F14"
                                                  )) ? (
                                                  <>
                                                    <span className="useless">
                                                      {finalItems.push({
                                                        name: formData[0][
                                                          index
                                                        ],
                                                        qty: item,
                                                        size: "-",
                                                      })}
                                                    </span>
                                                    <td key={index}>
                                                      {prices.TieS14}
                                                    </td>
                                                    <td key={index}>
                                                      {item * prices.TieS14}
                                                    </td>
                                                    <p className="useless">
                                                      {
                                                        (gst5Total +=
                                                          0.05 *
                                                          item *
                                                          prices.TieS14)
                                                      }
                                                    </p>

                                                    <p className="useless">
                                                      {
                                                        (subtotal +=
                                                          item * prices.TieS14)
                                                      }
                                                    </p>
                                                  </>
                                                ) : (
                                                  ""
                                                )}
                                              </>
                                            )}

                                            {/* Tie Knot ✅ */}
                                            {(formData[0][index].includes(
                                              "tie-Knot"
                                            ) &&
                                              formData[0][index].includes(
                                                "F14"
                                              )) ||
                                            (formData[0][index].includes(
                                              "tie-Knot"
                                            ) &&
                                              formData[0][index].includes(
                                                "M14"
                                              )) ||
                                            (formData[0][index].includes(
                                              "tie-Knot"
                                            ) &&
                                              formData[0][index].includes(
                                                "O14"
                                              )) ? (
                                              <>
                                                <span className="useless">
                                                  {finalItems.push({
                                                    name: formData[0][index],
                                                    qty: item,
                                                    size: "-",
                                                  })}
                                                </span>
                                                <td key={index}>
                                                  {prices.TieS14}
                                                </td>
                                                <td key={index}>
                                                  {item * prices.TieS14}
                                                </td>
                                                <p className="useless">
                                                  {
                                                    (gst5Total +=
                                                      0.05 *
                                                      item *
                                                      prices.TieS14)
                                                  }
                                                </p>
                                                <p className="useless">
                                                  {
                                                    (subtotal +=
                                                      item * prices.TieS14)
                                                  }
                                                </p>
                                              </>
                                            ) : (
                                              ""
                                            )}

                                            {/* Belt Price ✅ */}
                                            {formData[0][index].includes(
                                              "Belt"
                                            ) ? (
                                              <>
                                                <span className="useless">
                                                  {finalItems.push({
                                                    name: formData[0][index],
                                                    qty: item,
                                                    size: "-",
                                                  })}
                                                </span>
                                                <td key={index}>
                                                  {prices.Belt}
                                                </td>
                                                <td key={index}>
                                                  {item * prices.Belt}
                                                </td>
                                                <p className="useless">
                                                  {
                                                    (gst5Total +=
                                                      0.05 * item * prices.Belt)
                                                  }
                                                </p>
                                                <p className="useless">
                                                  {
                                                    (subtotal +=
                                                      item * prices.Belt)
                                                  }
                                                </p>
                                              </>
                                            ) : (
                                              ""
                                            )}
                                            <span className="useless">
                                              {counter++}
                                            </span>
                                          </tr>
                                        </>
                                      ) : (
                                        // For all Other Clothes
                                        <>
                                          {elements[index + 1] != "0" ? (
                                            <tr>
                                              <td key={index}>
                                                {formData[0][index]}
                                              </td>
                                              <td key={index}>{item}</td>
                                              <td key={index}>
                                                {elements[index + 1]}
                                              </td>

                                              {/* Winter Jacket ✅*/}
                                              {(formData[0][index].includes(
                                                "Winter Jacket"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Winter Jacket"
                                              ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Winter Jacket"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.HoodieS14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.HoodieS14}
                                                  </td>
                                                  <p className="useless">
                                                    {" "}
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.HoodieS14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.HoodieS14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                <>
                                                  {formData[0][index].includes(
                                                    "Winter Jacket"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "S512"
                                                  ) ? (
                                                    <>
                                                      <span className="useless">
                                                        {finalItems.push({
                                                          name: formData[0][
                                                            index
                                                          ],
                                                          qty: elements[
                                                            index + 1
                                                          ],
                                                          size: item,
                                                        })}
                                                      </span>
                                                      <td key={index}>
                                                        {prices.HoodieS512}
                                                      </td>
                                                      <td key={index}>
                                                        {elements[index + 1] *
                                                          prices.HoodieS512}
                                                      </td>
                                                      <p className="useless">
                                                        {
                                                          (gst5Total +=
                                                            0.05 *
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.HoodieS512)
                                                        }
                                                      </p>
                                                      <p className="useless">
                                                        {
                                                          (subtotal +=
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.HoodieS512)
                                                        }
                                                      </p>
                                                    </>
                                                  ) : (
                                                    ""
                                                  )}
                                                </>
                                              )}

                                              {/* Shirts ✅*/}
                                              {(formData[0][index].includes(
                                                "Shirt"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Shirt"
                                              ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Shirt"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                ) &&
                                                elements[index + 1] != "0") ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.ShirtS14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.ShirtS14}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.ShirtS14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.ShirtS14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                <>
                                                  {formData[0][index].includes(
                                                    "Shirt"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "S512"
                                                  ) &&
                                                  elements[index + 1] != "0" ? (
                                                    <>
                                                      <span className="useless">
                                                        {finalItems.push({
                                                          name: formData[0][
                                                            index
                                                          ],
                                                          qty: elements[
                                                            index + 1
                                                          ],
                                                          size: item,
                                                        })}
                                                      </span>
                                                      <td key={index}>
                                                        {prices.ShirtS512}
                                                      </td>
                                                      <td key={index}>
                                                        {elements[index + 1] *
                                                          prices.ShirtS512}
                                                      </td>
                                                      <p className="useless">
                                                        {
                                                          (gst5Total +=
                                                            0.05 *
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.ShirtS512)
                                                        }
                                                      </p>
                                                      <p className="useless">
                                                        {
                                                          (subtotal +=
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.ShirtS512)
                                                        }
                                                      </p>
                                                    </>
                                                  ) : (
                                                    ""
                                                  )}
                                                </>
                                              )}

                                              {/* Trousers ✅*/}
                                              {formData[0][index].includes(
                                                "Trousers"
                                              ) &&
                                              formData[0][index].includes(
                                                "S512"
                                              ) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.TrousersS512}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.TrousersS512}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.TrousersS512)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.TrousersS512)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                ""
                                              )}

                                              {/* Track Pants ✅*/}
                                              {(formData[0][index].includes(
                                                "Track Pants"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Track Pants"
                                              ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Track Pants"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.TrackPantsS14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.TrackPantsS14}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.TrackPantsS14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.TrackPantsS14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                <>
                                                  {formData[0][index].includes(
                                                    "Track Pants"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "S512"
                                                  ) ? (
                                                    <>
                                                      <span className="useless">
                                                        {finalItems.push({
                                                          name: formData[0][
                                                            index
                                                          ],
                                                          qty: elements[
                                                            index + 1
                                                          ],
                                                          size: item,
                                                        })}
                                                      </span>
                                                      <td key={index}>
                                                        {prices.TrackPantsS512}
                                                      </td>
                                                      <td key={index}>
                                                        {elements[index + 1] *
                                                          prices.TrackPantsS512}
                                                      </td>
                                                      <p className="useless">
                                                        {
                                                          (gst5Total +=
                                                            0.05 *
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.TrackPantsS512)
                                                        }
                                                      </p>
                                                      <p className="useless">
                                                        {
                                                          (subtotal +=
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.TrackPantsS512)
                                                        }
                                                      </p>
                                                    </>
                                                  ) : (
                                                    ""
                                                  )}
                                                </>
                                              )}

                                              {/* Track T Shirt ✅*/}
                                              {(formData[0][index].includes(
                                                "Track"
                                              ) &&
                                                formData[0][index].includes(
                                                  "T-shirt"
                                                ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Track"
                                              ) &&
                                                formData[0][index].includes(
                                                  "T-shirt"
                                                ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Track"
                                              ) &&
                                                formData[0][index].includes(
                                                  "T-shirt"
                                                ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.TrackTShirtS14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.TrackTShirtS14}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.TrackTShirtS14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.TrackTShirtS14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                <>
                                                  {formData[0][index].includes(
                                                    "Track"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "T-shirt"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "S512"
                                                  ) ? (
                                                    <>
                                                      <span className="useless">
                                                        {finalItems.push({
                                                          name: formData[0][
                                                            index
                                                          ],
                                                          qty: elements[
                                                            index + 1
                                                          ],
                                                          size: item,
                                                        })}
                                                      </span>
                                                      <td key={index}>
                                                        {prices.TrackTShirtS512}
                                                      </td>
                                                      <td key={index}>
                                                        {elements[index + 1] *
                                                          prices.TrackTShirtS512}
                                                      </td>
                                                      <p className="useless">
                                                        {
                                                          (gst5Total +=
                                                            0.05 *
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.TrackTShirtS512)
                                                        }
                                                      </p>
                                                      <p className="useless">
                                                        {
                                                          (subtotal +=
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.TrackTShirtS512)
                                                        }
                                                      </p>
                                                    </>
                                                  ) : (
                                                    ""
                                                  )}
                                                </>
                                              )}

                                              {/* Blazers ✅*/}
                                              {formData[0][index].includes(
                                                "Blazer"
                                              ) &&
                                              formData[0][index].includes(
                                                "S512"
                                              ) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.Blazer}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.Blazer}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst12Total +=
                                                        0.12 *
                                                        elements[index + 1] *
                                                        prices.Blazer)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.Blazer)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                ""
                                              )}

                                              {/* Shorts ✅*/}
                                              {(formData[0][index].includes(
                                                "Shorts"
                                              ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Shorts"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Shorts"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.Shorts}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.Shorts}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.Shorts)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.Shorts)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                ""
                                              )}

                                              {/* Skirts ✅*/}
                                              {(formData[0][index].includes(
                                                "Skirt"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Skirt"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.SkirtF14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.SkirtF14}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.SkirtF14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.SkirtF14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                ""
                                              )}

                                              {/* Socks ✅*/}
                                              {(formData[0][index].includes(
                                                "Socks"
                                              ) &&
                                                formData[0][index].includes(
                                                  "M14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Socks"
                                              ) &&
                                                formData[0][index].includes(
                                                  "F14"
                                                )) ||
                                              (formData[0][index].includes(
                                                "Socks"
                                              ) &&
                                                formData[0][index].includes(
                                                  "O14"
                                                )) ? (
                                                <>
                                                  <span className="useless">
                                                    {finalItems.push({
                                                      name: formData[0][index],
                                                      qty: elements[index + 1],
                                                      size: item,
                                                    })}
                                                  </span>
                                                  <td key={index}>
                                                    {prices.SocksS14}
                                                  </td>
                                                  <td key={index}>
                                                    {elements[index + 1] *
                                                      prices.SocksS14}
                                                  </td>
                                                  <p className="useless">
                                                    {
                                                      (gst5Total +=
                                                        0.05 *
                                                        elements[index + 1] *
                                                        prices.SocksS14)
                                                    }
                                                  </p>
                                                  <p className="useless">
                                                    {
                                                      (subtotal +=
                                                        elements[index + 1] *
                                                        prices.SocksS14)
                                                    }
                                                  </p>
                                                </>
                                              ) : (
                                                <>
                                                  {formData[0][index].includes(
                                                    "Socks"
                                                  ) &&
                                                  formData[0][index].includes(
                                                    "S512"
                                                  ) ? (
                                                    <>
                                                      <span className="useless">
                                                        {finalItems.push({
                                                          name: formData[0][
                                                            index
                                                          ],
                                                          qty: elements[
                                                            index + 1
                                                          ],
                                                          size: item,
                                                        })}
                                                      </span>
                                                      <td key={index}>
                                                        {prices.SocksS512}
                                                      </td>
                                                      <td key={index}>
                                                        {elements[index + 1] *
                                                          prices.SocksS512}
                                                      </td>
                                                      <p className="useless">
                                                        {
                                                          (gst5Total +=
                                                            0.05 *
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.SocksS512)
                                                        }
                                                      </p>
                                                      <p className="useless">
                                                        {
                                                          (subtotal +=
                                                            elements[
                                                              index + 1
                                                            ] *
                                                            prices.SocksS512)
                                                        }
                                                      </p>
                                                    </>
                                                  ) : (
                                                    ""
                                                  )}
                                                </>
                                              )}
                                            </tr>
                                          ) : (
                                            ""
                                          )}
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    ""
                                  )}
                                  {/* {
                              
                            } */}
                                  {<span className="useless">{counter++}</span>}
                                </>
                              ) : (
                                ""
                              )}
                              {/* <td key={index}>{formData[0][index]}</td> */}
                              {/* <p>{item}</p> */}
                            </>
                          )}
                        </>
                      ))
                    : ""}
                </tbody>
              </table>

              <div className="info">
                <div className="left">
                  <div className="terms">
                    <p className="bold">Terms and Conditions</p>
                    <p id="words">
                      1. Goods once sold will not be taken back or exchanged{" "}
                      <br />
                      2. All disputes are subject to Bangalore jurisdiction only
                    </p>
                  </div>
                </div>
                <div className="right">
                  <div className="taxes">
                    <div className="left">
                      <p>Taxable Amount</p>
                      <p>CGST @2.5%</p>
                      <p>SGST @2.5%</p>
                      <p>CGST @6%</p>
                      <p>SGST @6%</p>
                      <p>Round Off</p>
                    </div>
                    <div className="right taxes_right">
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {subtotal}
                      </p>

                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {gst5Total / 2}
                      </p>
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {gst5Total / 2}
                      </p>
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {gst12Total / 2}
                      </p>
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {gst12Total / 2}
                      </p>
                      <p>
                        {Math.round(subtotal + gst5Total + gst12Total) -
                          (subtotal + gst5Total + gst12Total)}
                      </p>
                    </div>
                  </div>

                  <p className="total bold">
                    TOTAL AMOUNT: {"   "} Rs.
                    {Math.round(subtotal + gst5Total + gst12Total)}
                  </p>
                  <div className="balances" id="remBalance">
                    <div className="form_received">
                      <label className="form_item" htmlFor="received_amt">
                        Received Amount
                      </label>
                      <input
                        className="form_item text2"
                        type="text"
                        name="received_amt"
                        id="received_amt"
                        onChange={amountHandler}
                      />
                    </div>
                  </div>
                  <div className="taxes">
                    <div className="left">
                      <p>Received Amount</p>
                      <p>Balance</p>
                    </div>
                    <div className="right">
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />
                        {recvamt}
                      </p>
                      <p>
                        <img src={Re} className="resymbol" alt="rupee" />{" "}
                        {Math.round(subtotal + gst5Total + gst12Total) -
                          recvamt}
                      </p>
                    </div>
                  </div>

                  <div className="total_words">
                    <p className="bold">Total Amount (in words)</p>
                    <InWords
                      amount={Math.round(subtotal + gst5Total + gst12Total)}
                    />
                  </div>

                  <div className="sign">
                    <img
                      src={Sign}
                      className="sign_img"
                      alt="Authorised Sign"
                    />
                    <p className="bold">Authorised Signatory for</p>
                    <p id="words">Aara.co</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="button_container">
        {confirmed ? (
          <button className="button confirm" onClick={invoiceDownloader}>
            Download Invoice
          </button>
        ) : (
          <button className="button confirm" onClick={confirmHandler}>
            Confirm order
          </button>
        )}

        <button
          className="button confirm reload"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload Page
        </button>
      </div>
    </>
  );
}

export default App;
