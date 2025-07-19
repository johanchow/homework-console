'use client'

import { LoginRegisterModal } from './LoginRegisterModal'

export function GlobalLoginModal() {
	return (
		<LoginRegisterModal onSuccess={() => {
			// 登录成功后的回调
			console.log('全局登录成功')
		}}>
			{/* 空的 children，这样组件只会在全局状态触发时显示 */}
		</LoginRegisterModal>
	)
} 