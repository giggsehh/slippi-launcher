import { css } from "@emotion/react";
import Typography from "@mui/material/Typography/Typography";
import React from "react";

import { AuthGuard } from "@/components/auth_guard";
import { Dropdown } from "@/components/form";
import { useDolphinStore } from "@/lib/dolphin/use_dolphin_store";
import { useAccount } from "@/lib/hooks/use_account";
import { useEnableQuickChat } from "@/lib/hooks/use_settings";
import type { AuthUser } from "@/services/auth/types";

import { SettingItem } from "../setting_item_section";
import { ChatMessagesFooter } from "./chat_messages_footer";
import { ChatMessagesInput } from "./chat_messages_input";
import { ChatSettingsMessages as Messages } from "./chat_settings.messages";
import { useChatMessages } from "./use_chat_messages";

const ChatConfigSettings = React.memo(({ user }: { user: AuthUser }) => {
  const userData = useAccount((store) => store.userData);
  const {
    loading,
    localMessages,
    setLocalMessages,
    dirty,
    availableMessages,
    submitChatMessages,
    discardLocalChanges,
  } = useChatMessages(user?.uid);

  const footer: React.ReactNode = React.useMemo(() => {
    if (!dirty) {
      return null;
    }
    return (
      <>
        {/*Element makes space for the footer when we are scrolled all the way down*/}
        <div
          css={css`
            height: 32px;
          `}
        />

        <div
          css={css`
            position: fixed;
            bottom: 0;
            padding: 16px;
            width: 100%;
            margin-left: -30px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0));
          `}
        >
          <ChatMessagesFooter
            loading={loading}
            dirty={dirty}
            saveToDatabase={submitChatMessages}
            discardChanges={discardLocalChanges}
          />
        </div>
      </>
    );
  }, [dirty, discardLocalChanges, loading, submitChatMessages]);

  const netplayDolphinOpen = useDolphinStore((store) => store.netplayOpened);
  const [quickChatSetting, setQuickChatSetting] = useEnableQuickChat();

  type quickChatValue = "0" | "1" | "2";
  const quickChatValues: { value: quickChatValue; label: string }[] = [
    { value: "0", label: "Enabled" },
    { value: "1", label: "Direct Only" },
    { value: "2", label: "Disabled" },
  ];

  return (
    <>
      <SettingItem name={Messages.quickChat()} description={Messages.quickChatDescription()}>
        <Dropdown
          value={quickChatSetting}
          options={quickChatValues}
          onChange={(selected) => setQuickChatSetting(selected)}
          disabled={netplayDolphinOpen}
        />
      </SettingItem>

      <SettingItem name={Messages.chatMessages()} description={Messages.chatMessagesDescription()}>
        <ChatMessagesInput
          messages={localMessages}
          updateMessages={setLocalMessages}
          availableMessages={availableMessages}
          user={{ uid: user.uid, subLevel: userData?.activeSubscription.level ?? "NONE" }}
        />
      </SettingItem>
      {footer}
    </>
  );
});

export const ChatSettings = React.memo(() => {
  return (
    <div
      css={css`
        min-width: 450px;
      `}
    >
      <Typography variant="h5">{Messages.chatSettings()}</Typography>
      <Typography variant="caption">{Messages.chatSettingsDescription()}</Typography>
      <AuthGuard
        fallback={<div>{Messages.pleaseLoginToUseFeature()}</div>}
        render={(user) => <ChatConfigSettings user={user} />}
      />
    </div>
  );
});
