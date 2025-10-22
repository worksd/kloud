'use client'
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import React, { useEffect, useState } from "react";
import { CommonSubmitButton } from "@/app/components/buttons";
import { useLocale } from "@/hooks/useLocale";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { checkDuplicateNickName } from "@/app/onboarding/action/check.duplicate.nickname.action";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";
import { kloudNav } from "@/app/lib/kloudNav";
