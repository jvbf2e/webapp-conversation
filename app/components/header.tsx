import type { FC } from "react";
import React from "react";
import { Bars3Icon, PencilSquareIcon } from "@heroicons/react/24/solid";
import AppIcon from "@/app/components/base/app-icon";
export type IHeaderProps = {
  title: string;
  isMobile?: boolean;
  onShowSideBar?: () => void;
  onCreateNewChat?: () => void;
};
const Header: FC<IHeaderProps> = ({
  title,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  return (
    <div className="shrink-0 flex items-center justify-between h-14 px-3 bg-gray-100">
      {isMobile ? (
        <div
          className="flex items-center justify-center h-8 w-8 cursor-pointer"
          onClick={() => onShowSideBar?.()}
        >
          <Bars3Icon className="h-4 w-4 text-gray-500" />
        </div>
      ) : (
        <div></div>
      )}
      {/* <div className="flex items-center space-x-2">
        <AppIcon size="small" />
        <div className=" text-sm text-gray-800 font-bold">{title}</div>
      </div> */}
      <div className="flex items-center justify-center">
        <img
          className="w-[28px]"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAABXCAYAAABxyNlsAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAX3SURBVHgB7Z1bTttoFMf/vjBC04wUpJaq0kh1VzDpwIx4I6xgYAWFFWBW0LCCMSsgrABYQc0bGuhMuoJmnqoylZp5G5HEnnN8oSHk4sT+Ppv4+0ltasdtyM/Hx+e7uYBC8RjRUCA27E9WF3rNh1bV4VsatJe8n7at4WM1+G0P3r8+jLYGr62j275yfmyhQOQqd93+VPdg1nRg0wfq9MNUkZ6WD59+4cJD3205L9rICelyWagG440HbTsjmRMh0W3AO9fRa8qObClya/bHqonKPkWTLUPoBFoe/KM/ndUmJCBULkepD31Xg/4GBYKjmfJ5s4feici0IURujW5MBvRG0aQOw5LpajoUFcmZy123/3lbgMt/JliyjtudrHNyZnJr9k3NAE7pcrPweHGunWcHyIhM5FK02vTyOxYAjuI++ltZ5OJUcrkKMFA5pn9kG4tFx4e39955foYUzC03vGkZ7x55GphGg9LEIeZkLrklERszt+CZ5ZZMbMxcgmeSW1KxMTMLTiy35GJjZhKcSG5YFTz5q+RiA6iK2ElaRehJDjLwvaPEhlCT/piv4iTHTpXLDYSi9xFIhnr4zNOa/XVq836i3OgMLUTLK2NqJnpvpx00US7fwKAYh81dqpMOGCs3TAeaBcVYaPzueNL7I+VyOqAOjH0oJsLBt25/box7f6TcsKNbs6BIgL4/7ub2QC5HraoOZoKqh1t71BsPGhFr9udmMeRqHQ39cxqD40HFjg6tzXt5ToMWzGnwLS8Yjtd+Qv50ejBftZyVzuBOc3Aj/6hlod4JCTy7dp66Sf7Ghv3V6qNbp4uQhpd8C/kQR29jcOe9yKUKgd+cWr9lj0Zn3D+qwHTcobM/C7/YN7s5Su5Qv8PK4I57ctfsm4+yb2Qk4ugHLDXSSB0mvyDpbV07L9x4607umv1lm/LYKaShUR7t7/2RcihlHGG66L+THMUuRe9WvDFQLfSljYPR1dE2YbwWJZa5dFba1MLkLypzClNtsCy7k0s3st8gARbLX5q/PATDn0F3cZmCqzq6d0EayKUcVYeUSRxaR5bYGC6PqBdrR4tKOdEYwGb850AudQDvQgJUZh3IFBvDn0m5dw8SoDLyfuRSSpBQiHvnV5JmF46CbjQuffEjiKe6EXWm61ECrkEwJr6zkTN9GA16yazkG8ctjDq/6tTpK1wsXSwXeaSDYaLmqfDo1aJg5bQgXC59WBMFgWp5YeXfwGdY/KrLKLK7WBL+hZJCeZ/LMhcC8aPOJF18r5J/0cqwaZsFFFAfIJC4CyHR0HoafLktpIToLgTDFQOlBbyCQHiNGArGErpSTrjwyPWgFyolMJcS1qb1AEu4XOr5aqOYCD/pwuWWmTLLFd5RVUq5SeZ5pUWD0aE6Fy9RMmQ0+Q30O2VNC8LlckVSUrleHWIJKpGSytU3IZSweV06uT8HcxtEVwp+OSNXkzKfwXf591LJ5aiVM+nFD/ouSiOXVyRpkmbh9LAcyDVREkxUWKwF4Xzrvy5F5EaPLJA0QBrmW2bh5f568IWnxEpbkUQ5/W5Ia6HlcsR6vt+EJHhWTzRGF7CQOTd61BbnWKlzJTx454PbCyc3LLcg6eZ1nyUsOYPbCyGXI1VHhaT6+/mtQno48eXRyWWRy1iuhg/U1Hmciqe+1sN383s05aiJL7nIjaaszr30lQb/Ao1FeYRqeCN71hzer8bQMsEb+YCL0rTQRDEuahkVuSmJ1l2MRMlNAT/JdNLUWCV3TqKFMxMfJqTkzgmvsZg2oVvJnQvvkNdYTDtKyZ0ZXvT9vJHkSFWKzQDn2ScwEi+5UpGbkHjl5ywLwJXcBMy7pFbJnUKatcpK7gSoY6iVZq2ykjsGqmNPnsBMtQhcVQujOXjvrDpIiZI7QPjYAGPnylnJZLWPSgsB/AAjHFIN+zorsYyKXBr7MmHuilj4XWK5/gVFbOPaWXUhCOFyeeEFCgNf/n2SqjsipcYIl8sLL5A7QZS6FRiO6zyV9vOYPvC3yBU9/2E5B7kcod4H7sEy0Tu7zOm/SvwfLUADiA0Pw40AAAAASUVORK5CYII="
        />
        <div className="relative ml-[5px] text-left">
          <div className="text-[24px] font-bold">Qucent Search</div>
          <img
            className="absolute w-[30px] top-[-6px] right-[-12px]"
            src="data:image/png;base64,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"
          />
        </div>
      </div>

      {isMobile ? (
        <div
          className="flex items-center justify-center h-8 w-8 cursor-pointer"
          onClick={() => onCreateNewChat?.()}
        >
          <PencilSquareIcon className="h-4 w-4 text-gray-500" />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default React.memo(Header);
