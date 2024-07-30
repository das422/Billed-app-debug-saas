/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import { ROUTES } from "../constants/routes.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = NewBillUI();
    });
    //le fichier est bien ajouté si le format est valide

    test("Then handleChangeFile() function should be called", () => {
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: {},
      });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const file = screen.getByTestId("file");
      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("test.png");
    });
  });

  //Test intégration POST
  //la nouvelle de frais peut être envoyée
  describe("When I am on NewBill Page, i fill the form and I click on send button", () => {
    test("Then the bill is created and i am redirected to the bills page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: {},
      });
      //mock data to fill the form
      const type = screen.getByTestId("expense-type");
      const name = screen.getByTestId("expense-name");
      const amount = screen.getByTestId("amount");
      const date = screen.getByTestId("datepicker");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");
      const file = screen.getByTestId("file");

      fireEvent.change(type, { target: { value: "IT et électronique" } });
      fireEvent.change(name, { target: { value: "Vol Paris Tokyo" } });
      fireEvent.change(amount, { target: { value: "348" } });
      fireEvent.change(date, { target: { value: "2023-11-20" } });
      fireEvent.change(vat, { target: { value: "70" } });
      fireEvent.change(pct, { target: { value: "20" } });
      fireEvent.change(commentary, { target: { value: "" } });
      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.jpg", { type: "image/jpg" })],
        },
      });

      const newBillForm = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      newBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
