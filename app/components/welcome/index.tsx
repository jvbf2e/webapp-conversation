"use client";
import type { FC, ReactNode } from "react";
import React, { useEffect, useState } from "react";
import Textarea from "rc-textarea";
import { useTranslation } from "react-i18next";
import TemplateVarPanel, { PanelTitle, VarOpBtnGroup } from "../value-panel";
import s from "./style.module.css";
import {
  AppInfoComp,
  ChatBtn,
  EditBtn,
  PromptTemplate,
} from "./massive-component";
import type { AppInfo, PromptConfig } from "@/types/app";
import Tooltip from "@/app/components/base/tooltip";
import Toast from "@/app/components/base/toast";
import Select from "@/app/components/base/select";
import { DEFAULT_VALUE_MAX_LEN } from "@/config";

// regex to match the {{}} and replace it with a span
const regex = /\{\{([^}]+)\}\}/g;

export type IWelcomeProps = {
  conversationName: string;
  hasSetInputs: boolean;
  isPublicVersion: boolean;
  siteInfo: AppInfo;
  promptConfig: PromptConfig;
  onStartChat: (inputs: Record<string, any>) => void;
  canEditInputs: boolean;
  savedInputs: Record<string, any>;
  onInputsChange: (inputs: Record<string, any>) => void;
};

const Welcome: FC<IWelcomeProps> = ({
  conversationName,
  hasSetInputs,
  isPublicVersion,
  siteInfo,
  promptConfig,
  onStartChat,
  canEditInputs,
  savedInputs,
  onInputsChange,
}) => {
  const { t } = useTranslation();
  const hasVar = promptConfig.prompt_variables.length > 0;
  const [isFold, setIsFold] = useState<boolean>(true);
  const [inputs, setInputs] = useState<Record<string, any>>(
    (() => {
      if (hasSetInputs) return savedInputs;

      const res: Record<string, any> = {};
      if (promptConfig) {
        promptConfig.prompt_variables.forEach((item) => {
          res[item.key] = "";
        });
      }
      return res;
    })()
  );
  const [query, setQuery] = React.useState("");
  const isUseInputMethod = React.useRef(false);
  const handleContentChange = (e: any) => {
    const value = e.target.value;
    setQuery(value);
  };
  useEffect(() => {
    if (!savedInputs) {
      const res: Record<string, any> = {};
      if (promptConfig) {
        promptConfig.prompt_variables.forEach((item) => {
          res[item.key] = "";
        });
      }
      setInputs(res);
    } else {
      setInputs(savedInputs);
    }
  }, [savedInputs]);

  const highLightPromoptTemplate = (() => {
    if (!promptConfig) return "";
    const res = promptConfig.prompt_template.replace(regex, (match, p1) => {
      return `<span class='text-gray-800 font-bold'>${
        inputs?.[p1] ? inputs?.[p1] : match
      }</span>`;
    });
    return res;
  })();

  const { notify } = Toast;
  const logError = (message: string) => {
    notify({ type: "error", message, duration: 3000 });
  };

  const renderHeader = () => {
    return (
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between border-b border-gray-100 mobile:h-12 tablet:h-16 px-8 bg-white">
        <div className="text-gray-900">{conversationName}</div>
      </div>
    );
  };

  const renderInputs = () => {
    return (
      <div className="space-y-3">
        {promptConfig.prompt_variables.map((item) => (
          <div
            className="tablet:flex items-start mobile:space-y-2 tablet:space-y-0 mobile:text-xs tablet:text-sm"
            key={item.key}
          >
            <label
              className={`flex-shrink-0 flex items-center tablet:leading-9 mobile:text-gray-700 tablet:text-gray-900 mobile:font-medium pc:font-normal ${s.formLabel}`}
            >
              {item.name}
            </label>
            {item.type === "select" && (
              <Select
                className="w-full"
                defaultValue={inputs?.[item.key]}
                onSelect={(i) => {
                  setInputs({ ...inputs, [item.key]: i.value });
                }}
                items={(item.options || []).map((i) => ({ name: i, value: i }))}
                allowSearch={false}
                bgClassName="bg-gray-50"
              />
            )}
            {item.type === "string" && (
              <input
                placeholder={`${item.name}${
                  !item.required ? `(${t("app.variableTable.optional")})` : ""
                }`}
                value={inputs?.[item.key] || ""}
                onChange={(e) => {
                  setInputs({ ...inputs, [item.key]: e.target.value });
                }}
                className={
                  "w-full flex-grow py-2 pl-3 pr-3 box-border rounded-lg bg-gray-50"
                }
                maxLength={item.max_length || DEFAULT_VALUE_MAX_LEN}
              />
            )}
            {item.type === "paragraph" && (
              <textarea
                className="w-full h-[104px] flex-grow py-2 pl-3 pr-3 box-border rounded-lg bg-gray-50"
                placeholder={`${item.name}${
                  !item.required ? `(${t("app.variableTable.optional")})` : ""
                }`}
                value={inputs?.[item.key] || ""}
                onChange={(e) => {
                  setInputs({ ...inputs, [item.key]: e.target.value });
                }}
              />
            )}
            {item.type === "number" && (
              <input
                type="number"
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 "
                placeholder={`${item.name}${
                  !item.required
                    ? `(${t("appDebug.variableTable.optional")})`
                    : ""
                }`}
                value={inputs[item.key]}
                onChange={(e) => {
                  onInputsChange({ ...inputs, [item.key]: e.target.value });
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const canChat = () => {
    const inputLens = Object.values(inputs).length;
    const promptVariablesLens = promptConfig.prompt_variables.length;
    const emptyInput =
      inputLens < promptVariablesLens ||
      Object.values(inputs).filter((v) => v === "").length > 0;
    if (emptyInput) {
      logError(t("app.errorMessage.valueOfVarRequired"));
      return false;
    }
    return true;
  };

  const handleChat = () => {
    if (!canChat()) return;

    onStartChat(inputs);
  };

  const handleKeyUp = (e: any) => {
    if (e.code === "Enter") {
      e.preventDefault();
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current) handleChat();
    }
  };

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing;
    if (e.code === "Enter" && !e.shiftKey) {
      setQuery(query.replace(/\n$/, ""));
      e.preventDefault();
    }
  };

  const renderChat = () => {
    return (
      <div className={"absolute z-10 bottom-0 left-0 right-0"}>
        <div className="p-[5.5px] max-h-[150px] bg-white border-[1.5px] border-gray-200 rounded-xl overflow-y-auto">
          <Textarea
            className={`
                  block w-full px-2 pr-[118px] py-[7px] leading-5 max-h-none text-sm text-gray-700 outline-none appearance-none resize-none
                `}
            value={query}
            placeholder="Enter键发送，Shift+Enter键换行"
            onFocus={handleChat}
            autoSize={{ minRows: 2 }}
          />
          <div className="absolute bottom-2 right-2 flex items-center h-8">
            {/* <div className={`${s.count} mr-4 h-5 leading-5 text-sm bg-gray-50 text-gray-500`}>{query.trim().length}</div> */}
            <Tooltip
              selector="send-tip"
              htmlContent={
                <div>
                  <div>{t("common.operation.send")} Enter</div>
                  <div>{t("common.operation.lineBreak")} Shift Enter</div>
                </div>
              }
            >
              <div
                className={`${s.sendBtn} w-8 h-8 cursor-pointer rounded-md`}
                onClick={handleChat}
              ></div>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  const renderNoVarPanel = () => {
    if (isPublicVersion) {
      return (
        <div>
          <AppInfoComp siteInfo={siteInfo} />
          <TemplateVarPanel
            isFold={false}
            header={
              <>
                <PanelTitle
                  title={t("app.chat.publicPromptConfigTitle")}
                  className="mb-1"
                />
                <PromptTemplate html={highLightPromoptTemplate} />
              </>
            }
          >
            <ChatBtn onClick={handleChat} />
          </TemplateVarPanel>
        </div>
      );
    }
    // private version
    return (
      <TemplateVarPanel
        isFold={false}
        header={<AppInfoComp siteInfo={siteInfo} />}
      >
        <ChatBtn onClick={handleChat} />
      </TemplateVarPanel>
    );
  };

  const renderVarPanel = () => {
    return (
      <TemplateVarPanel
        isFold={false}
        header={<AppInfoComp siteInfo={siteInfo} />}
      >
        {renderInputs()}
        <ChatBtn
          className="mt-3 mobile:ml-0 tablet:ml-[128px]"
          onClick={handleChat}
        />
      </TemplateVarPanel>
    );
  };

  const renderVarOpBtnGroup = () => {
    return (
      <VarOpBtnGroup
        onConfirm={() => {
          if (!canChat()) return;

          onInputsChange(inputs);
          setIsFold(true);
        }}
        onCancel={() => {
          setInputs(savedInputs);
          setIsFold(true);
        }}
      />
    );
  };

  const renderHasSetInputsPublic = () => {
    if (!canEditInputs) {
      return (
        <TemplateVarPanel
          isFold={false}
          header={
            <>
              <PanelTitle
                title={t("app.chat.publicPromptConfigTitle")}
                className="mb-1"
              />
              <PromptTemplate html={highLightPromoptTemplate} />
            </>
          }
        />
      );
    }

    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <>
            <PanelTitle
              title={t("app.chat.publicPromptConfigTitle")}
              className="mb-1"
            />
            <PromptTemplate html={highLightPromoptTemplate} />
            {isFold && (
              <div className="flex items-center justify-between mt-3 border-t border-indigo-100 pt-4 text-xs text-indigo-600">
                <span className="text-gray-700">
                  {t("app.chat.configStatusDes")}
                </span>
                <EditBtn onClick={() => setIsFold(false)} />
              </div>
            )}
          </>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    );
  };

  const renderHasSetInputsPrivate = () => {
    if (!canEditInputs || !hasVar) return null;

    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <div className="flex items-center justify-between text-indigo-600">
            <PanelTitle
              title={
                !isFold
                  ? t("app.chat.privatePromptConfigTitle")
                  : t("app.chat.configStatusDes")
              }
            />
            {isFold && <EditBtn onClick={() => setIsFold(false)} />}
          </div>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    );
  };

  const renderHasSetInputs = () => {
    if ((!isPublicVersion && !canEditInputs) || !hasVar) return null;

    return (
      <div className="pt-[88px] mb-5">
        {isPublicVersion
          ? renderHasSetInputsPublic()
          : renderHasSetInputsPrivate()}
      </div>
    );
  };

  return (
    <div className="relative mobile:min-h-[48px] tablet:min-h-[64px]">
      {hasSetInputs && renderHeader()}
      <div className="mx-auto pc:w-[794px] max-w-full mobile:w-full px-3.5">
        {/*  Has't set inputs  */}
        {!hasSetInputs && (
          <div>
            <div>
              <div className="flex items-center justify-center">
                <img
                  className="w-[60px]"
                  src="data:image/png;base64,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"
                />
                <div className="relative ml-[15px] text-left">
                  <div className="mobile:text-[36px] text-[45px] font-bold bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 bg-[length:200%_100%] animate-[shadow_10s_infinite_ease-in-out]">
                    Qucent Search
                  </div>
                  <div className="text-[12px] w-[320px] text-gray-800">
                    如果您有任何与汽车相关的问题，我很乐意为您提供帮助，请随时告诉我您的需求。
                  </div>
                  <img
                    className="mobile:right-[5px] absolute w-[50px] top-[10px] right-[65px]"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAAAhCAYAAABKmvz0AAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA26SURBVHgBlVpbjJ1VFV7rP2da6Ezb6ZVLgU5RVOQyAyiGICmIjygIGoUHFd80Kq3w4AMJ6psvBjAaE4NpfFJ8aAmQophABG9I6AxgAFvaUhGktHUIMyWdmX8v917X/Z/pFP3T6TnnP/uy9re+9a21938Q/o9rfuc3r8U+3gOAE0Qwilh/m+8Q5Dv5hRJ/lNvlPd/NXybKt9FepQ1p27iHPFrSMQlJ2vF77VMunsumtnGQ55fPlMpkicC6A/eXvjqP2ztgPzdMhIjcvtxGNVBNocnc4L5V25/bUUbB/wVA2rlttO23O3PzrdVtPAmIbCSq5cUQB9PAsUXLm4Kpg+gAd0ETYOp+Cq6BFoAYCOBgQsepi8cIZzPQ4ABTWw2ddJ2Jhxfn8L+C846R7c/d/r5AFhDTEO3Jo46B+AmMiYjgC5dFsY1IYTCvqHyXzLtJgK4XQeLuWLzcZ6AFxC5j+Dtnj/RBdxy509DmYAcZqzrO1ObhKJtPWeE2dxyWEtTzNETbGnifq+2le3Pzzbo6A5GiRZmyTMdTInsVlZbSChl7VCAwCOLvqDOgkbUKP4SYtnwZooICsLDDbsew1grlrzgVozt1zWDTIQgir3zTG9gXygaz7I5TMpJ2bxtrF9IB8MHFgmAlqhXm0TKlaV2C2uMVsyrjXW+gZoWPcRLdgwhzbaN6pnOKGSnmGGSzy4+Gf2FX+SbVtpk8SFTIuFQxgDr2l/9Oycg0T3eAz+6GiDd4hGSux07ycFcjaADal+5JA5k6vCEyNtYepkVvjDwWXujvURDTsKaqPbnSOIiVdqLpAHVoqvGjcYFQk8ZIwticEkjCNGFLROxEH1q4aPbshnptftinDCtxYWOJqCGHHMh32poWGezoOCgqF1BpQxiCUKV1jR3TFjCHQUWKzgpqD6BGoPJBxobKUQ3QnvfRSJwAz4ayjAC0YhhoGpIwRdcoz4Cg+JpwOpHFGZpUiJyf3coqJCq0URQvqIvkszhs3p6gtj301MooUCcKMwkswgx8BdREtLKjtMtx+dqSQJZsnV9GqWKjGG+DNEjknxkMPGsc+jf+FPAD1wGAW0gRsuTJQWyq5KHOEDTQzxkAln1dMyn6oc1JopVoTC0sRAXAnEum6QpGlAGa5FCo06jBRAMShMEYbGhyaUb22nFiuMBEq1JasdB0xebA9RfIm3deFyMrBiyeIBYSb4KtZq7ns4F2zGUNUZaGkQ0EwxuRoDMscyuZT1GB7pjQRbTSiEiswlfSesvNSV5yNlNLAjnfwGWyBsR6YFDaE4TuaZQArj5HjChA2hqh1iKFqop4u0HqrBpQM7wOK/eqJGKXhmWf/TEuu/5u9V2UTWaeEgsj8QURjKF8p5LHKoTNXtMSLenkbtODg0sCiYRj5hFftL40jSzYDDQxxlWbsgeO57/33NlkQCWNhOyZJvZZpjrgzsJqGbWslBvJSEEGEs/frDk/IzkMNHO4NtXiWn1lOllPUAWZQaVJzNbVsa1SF6xmGtk+OdmHpYAEGufoVLqh4WZsV/FOSUSa+qcjDK0AOvIP8dJ5V0Gz/kMsOgzs9CFIB5+2FWKnynB5z//WX4i4ZjM0o5tl3LlZpGMHod3/hJdO5FQj6l16K+LIRrF5aBh6E7exxQt7H0d4902qso9qPMHQ5V9BXHmGLjOPNjcD81MPAuX2VOmmYmy0VisLEch0sww5WZotCWTuMy6TC+E067lRgE5EcePoOWLA8aPQuy6H2Iq1QBlARn/FOhkyA5ue/QUXuJE1IxP0L/48NBfdnPtlVs/NMrszoOr29dBOPcgNlS2Ia7dgf+JWt7g56xL+K9fCwT+aJJAnFvVe/5JbGDy+lo0ALh+B/qVfgBNP3Y8Lz/9as7pRhVwmI+EJMvrla0sCOffoNyby5mDUPBN76ihkKv0Tb688RxczDunQn6F96eHCJmk4vA76198DvbFPAu17PLPzNTvQ8PKkd9HNWEBsX94N7Yu/KUCy15vhDdD/9Pewf+kXZcwTsx6b6dh+eG/HZ2D5p+7OEfAJOPHQtyAdfRVsJ2K1Xydf5Telj98oDP34V2HoY7dDb9Nl0L7wK9mmg1UHIQ5gUSmhKHQCeJLXfTIgm7YZg652eVVfF+a1EnuieXMK0vMPZkocjywze4TSG3uk8apzoT5c4Gt4PfQuviW3exvaPb/MDjgOdpCRZg5j+uczMtSaLaLFZoPGeM7Y7LR0dL9PqYz3KVAztouK76OJFl7aLbeWD3tyNQfbeL5Z4AC0Y62MVUqTSwKZ5XsC6prD9REDWYhEUv638GXWANh21TQ/nDI/y5ZFRs6s23ih9H1lt9eHlo0ZrGUjYsv8rMkMxkIzZGvPBzq2Hyzbu+SE9NDAQjybs22il0BH95GNAR1d1UMXT72R3Rf6/VNoZA8mxANlrGTqyFarIkr1W3SDTc0ZZ/UmSTRZI50LMS3h0ApZfNY9VCrZ8U5z9hX8XbPxo6yJlJMWLst/mWncP9eH5TUdPRDVka6yOeMiufXuvz2USbVXTFNzhkawf8nN1Bu7OienM1kXB6/2nTdqGVMe1HyKwy9V+Ok135maXhLIhmBzAlPnBk0f5FO1hVKwcFUO65KxpRCHehvIa8lNespYnD6kHFbf5yjpG2AZPMh/NPM2A96+9fciSJRm30I4MQMiT6na1hUHDQvIxw5UtS4a4bnebXJWX37Dj7KOn4kLrzwGdOBp8IgqSW7LNbnCuCAzci/oPkbRj6LPo0POJ61gmjLMTgpkbjQeZQN5wnGag8JqEyhInFxKu6rA5vZZA3H0PEilBJo77vqIXFRlMHKpU/Rx7vc/6NRXekKDYI8LytAuGbK1tCwtoQ11VnGZGLqilDtnwoknf5jl4zHri/baO/sy7pGO7OXdCrqbJaTJM77v3y3gJg2zRRo59+i2CQhJ1tEC1DAy5MYSTQ5fKTmoe+aAGz4ivfb+rvIWhZR3nEhQccEdZg1j96P3sj4yCJytIxOrwWx0M3Z1zvYzGcTfxoo0dZYwZzYWxp+Y0b06oRKmDnMdHK2aLncOwlJANu3CGGjuwkXHgmji2Fm0Adlsvgog149yLKb11+pzoTf+pZK5IR1+CTrJVPW7sBFzmdNs2Qr1Mq1eKAW3nQyRPJqISi/vaHgoqwsra11Kl43ETXdUDulN43TaTfezXqas7yYZiLbFp4GESVQnzwYaZ+Si0M4V3Vb0kCYfh08uk2cyobaFWQntnGS4GL/mLoDpQ1jeYwYRN3yYC+z2T/fnNkekkI6jOIYk5Wzdu/zLMHTV1yGdv7Vs9WSekQ15lzMGaf8TmJ55ADxLW5Fdwi7XlaXx8ht/knXy1czMfbkO3SUAiu2YcklW6tvTbvk5tHl3VcqcZt0F1Jw9gQsHnoL+yrMykPt0rb4XDGeLGxGqE6VyLfQjtHuDQN5z25XfzS9jDmAQG9GPK2SrZGeAzaYrpH7MpU9T9DBn0gIgI553GOlvD0B6900rOTRZmGH5XV4EzR5mduHaMQ41XL6CN96lhmxffkSLezfTNwX0n/3UrD4XccUaaHIZk15/NieN/aAnnGxz+69JbLJGNus+CL3zruSdVvvGHpz/y8/y5uGvXCnMv7izbBH5tKvabNQTojyrYVaW+mdy9Z1T93UMqq/2kW8fyE3HHD5OlVYfaygD6TNfDjWyxEAUoiysSZIsdEvn0QpW2qXOiYzsXal6/hJt7XtjiVQDpX3yse2Jn0WTMDJFX08YcQJk7SsHW5Kr1qEbCOo8j39o1Z0v3GS4dTSyHObmlpvtI3U27uDpx+7bptM+I9T7MdMSPScFtBNGMNHRyjz0NDAD1WmnhZ1AWnmSfNGu/q6jLhw0UMYMXt160dbqIJtdUf0jWobNpfNkPVQ32eTD3CqYsfNYIcCiAWNqo6ISToC+hQBPHX6oDLHNC0f4Sbp/QoRaW6yztgArJyiaAHnNgfbAoHoWVJmNAyuJCPBL61FLMqrNDEaP9sBSQLa93pbu0J68sCpLPER8eqroqgZZdnbuDbLMoglir0Z6Hun1ThWidSSEYcln7dRmVSk4sK9HWwC6v6iz1zUu+DrEnDoyebgh7E3BUkBC6++8ZlKCySMH1SE7OIhvCbpEtUPUQYgRqRNOoQS2Wn1vCwJlRKfa9L2VWUjKMHDPG47Y7QMW/BjHQiINetZOHpFRsbjGqxiV5zg7Tt8+eRCWArLXwi4wBHX5VVDYryUkW1pIWtZBn1Q6Gpv0MDbANu+Tt/FLHOafxGEKp3VBfwBTQ2u6AeGTcJ2UCODIGqYRSuUnNSLx4XaMhGSVJZOXpntN7/swcHWAxM/dO5273NttIisQpbA9DgU4oJsoAjs0sLCFQQZCJ6xjp+ILJ6pxVaCN8javPS+Kgauk1A0NY1U4DCtJt5oYzGFU9bHtcLG5cergdO74tUE2LgKyXL0b7ttewAzj0JKxhynE3pti4tCWOkm5qASA3VWGWGpCdLKi1u5V2YOVRpIpW9dZBJXlaERFsxXBIpwCYqp3nWA+reKSP/+hRbxu1V0v7IKTXAhLXPMPb7s2974xk3605HpdOwEN/OKLEcxT8Pa0+kkd121yAMqnyeWEIiV/NNpYzkxayujvghquPpP/fIfDzvpw7Si2NGxL8u+5n0qNIsHPVlqtSfVnZci/9YnBVbOUjUnvp/jtUP73Tt4b7Vq5ffJJOMX1X3G5dcR35UOPAAAAAElFTkSuQmCC"
                  />
                </div>
              </div>
              <div className="relative mt-[15vh]">{renderChat()}</div>
            </div>
            {/* {hasVar ? renderVarPanel() : renderNoVarPanel()} */}
          </div>
        )}

        {/* Has set inputs */}
        {hasSetInputs && renderHasSetInputs()}

        {/* foot */}
        {!hasSetInputs && (
          <div className="mt-4 flex justify-between items-center h-8 text-xs text-gray-400">
            {siteInfo.privacy_policy ? (
              <div>
                {t("app.chat.privacyPolicyLeft")}
                <a
                  className="text-gray-500"
                  href={siteInfo.privacy_policy}
                  target="_blank"
                >
                  {t("app.chat.privacyPolicyMiddle")}
                </a>
                {t("app.chat.privacyPolicyRight")}
              </div>
            ) : (
              <div></div>
            )}
            <span className="flex items-center pr-3 space-x-3">
              内容由AI生成，或有偏差，请审慎核实
            </span>
            {/* <a
              className="flex items-center pr-3 space-x-3"
              href="https://dify.ai/"
              target="_blank"
            >
              <span className="uppercase">{t("app.chat.powerBy")}</span>
              <FootLogo />
            </a> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Welcome);
