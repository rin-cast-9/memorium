import { AuthTabs } from "@/utils/AuthTabs";
import Divider from "./Divider";
import ValidatedInput from "./ValidatedInput";
import PasswordInput from "./PasswordInput";
import Checkbox from "./Checkbox";
import { useState } from "react";
import YandexAuthButton from "./YandexAuthButton";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { validateEmail, validateFullName } from "@/utils/validators";

type SignupTabProps = {
    email: string;
    password: string;
    fullName: string;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
    setFullName: (v: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    fullNameError?: string | null;
    emailError?: string | null;
};

const SignupTab = ({
    email,
    password,
    fullName,
    setEmail,
    setPassword,
    setFullName,
    onSubmit,
    fullNameError,
    emailError,
}: SignupTabProps) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="mt-[30px]">
            <YandexAuthButton
                activeTab={AuthTabs.SIGNUP}
            />

            <Divider/>

            <form onSubmit={onSubmit}>
                <ValidatedInput
                    value={fullName}
                    setValue={setFullName}
                    validate={validateFullName}
                    type="text"
                    placeholder="Full name"
                    label="Full name"
                    serverError={fullNameError}
                />
                <div className="flex w-full gap-[20px] mt-[20px]">
                    <ValidatedInput
                        value={email}
                        setValue={setEmail}
                        validate={validateEmail}
                        type="email"
                        placeholder="Email"
                        label="Email"
                        serverError={emailError}
                        showSuccess
                    />
                    <PasswordInput
                        value={password}
                        setValue={setPassword}
                        placeholder="Password"
                        label="Password"
                        forgotPasswordLink="#"
                    />
                </div>
                <Checkbox
                    checked={accepted}
                    onChange={setAccepted}
                    className="mt-[30px]"
                >
                    <span className="font-text-small text-[var(--color-white)]/40">
                        I accept the <span className="text-[var(--color-white)]/70">terms</span> and <span className="text-[var(--color-white)]/70">conditions</span>
                    </span>
                </Checkbox>
                <div className="flex justify-center mt-[30px]">
                    <Button
                        label={"Sign up"}
                        size={ButtonSize.NORMAL}
                        type={accepted ? ButtonType.PRIMARY : ButtonType.DISABLED}
                        htmlType="submit"
                    />
                </div>
            </form>
        </div>
    );
};

export default SignupTab;