import ValidatedInput from "./ValidatedInput";
import PasswordInput from "./PasswordInput";
import Button from "./Button";
import { ButtonSize, ButtonType } from "@/utils/Button.types";
import { validateEmail } from "@/utils/validators";
import { useTranslations } from "next-intl";

type LoginTabProps = {
    email: string;
    password: string;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    loginError?: string | null;
};

const LoginTab = ({
    email,
    password,
    setEmail,
    setPassword,
    onSubmit,
    loginError,
}: LoginTabProps) => {
    const t = useTranslations();

    return (
        <div className="mt-[30px]">
            <form onSubmit={onSubmit}>
                <div className="flex w-full gap-[20px] mt-[20px]">
                    <ValidatedInput
                        value={email}
                        setValue={setEmail}
                        validate={validateEmail}
                        type="email"
                        placeholder={t("enterEmail")}
                        label={t("email")}
                        serverError={loginError}
                        showSuccess
                    />
                    <PasswordInput
                        value={password}
                        setValue={setPassword}
                        placeholder={t("enterPassword")}
                        label={t("password")}
                        forgotPasswordLink="#"
                        error={loginError ?? undefined}
                        showSuccess
                    />
                </div>
                <div className="flex justify-center mt-[30px]">
                    <Button
                        label={t("login")}
                        size={ButtonSize.NORMAL}
                        type={ButtonType.PRIMARY}
                        htmlType="submit"
                    />
                </div>
            </form>
        </div>
    );
};

export default LoginTab;