import { render, screen, fireEvent } from "@testing-library/react";
import { LangProvider, useLang } from "../i18n";
import { describe, it, expect } from "vitest";
import React from "react";

const TestComponent = () => {
  const { tf, lang, setLang, formatPrice, onRequest } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="tf-id">{tf({ id: "Halo", en: "Hello" })}</span>
      <span data-testid="tf-en">{tf({ en: "English only" })}</span>
      <span data-testid="format-price">{formatPrice(2500000)}</span>
      <span data-testid="on-request">{onRequest()}</span>
      <button onClick={() => setLang("id")}>Set ID</button>
    </div>
  );
};

describe("i18n (useLang hook)", () => {
  it("defaults to English", () => {
    render(
      <LangProvider>
        <TestComponent />
      </LangProvider>
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("translates using Indonesian when lang is id", () => {
    render(
      <LangProvider>
        <TestComponent />
      </LangProvider>
    );
    expect(screen.getByTestId("tf-id")).toHaveTextContent("Hello");
  });

  it("formats price in USD by default", () => {
    render(
      <LangProvider>
        <TestComponent />
      </LangProvider>
    );
    expect(screen.getByTestId("format-price")).toHaveTextContent("$");
  });

  it("returns 'On Request' for onRequest in English", () => {
    render(
      <LangProvider>
        <TestComponent />
      </LangProvider>
    );
    expect(screen.getByTestId("on-request")).toHaveTextContent("On Request");
  });

  it("switches language and currency", () => {
    render(
      <LangProvider>
        <TestComponent />
      </LangProvider>
    );
    fireEvent.click(screen.getByText("Set ID"));
    expect(screen.getByTestId("lang")).toHaveTextContent("id");
    expect(screen.getByTestId("tf-id")).toHaveTextContent("Halo");
    expect(screen.getByTestId("format-price")).toHaveTextContent("IDR");
    expect(screen.getByTestId("on-request")).toHaveTextContent("Tanya Harga");
  });
});
