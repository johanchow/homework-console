import { Card, CardContent, CardHeader } from '@/component/card'
import { Skeleton } from '@/component/skeleton'

export function GoalListSkeleton() {
	return (
		<>
			{/* 过滤和搜索区域骨架屏 */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="w-full sm:w-48">
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="w-full sm:w-auto">
						<Skeleton className="h-10 w-32" />
					</div>
				</div>
			</div>

			{/* 结果统计骨架屏 */}
			<div className="mb-6">
				<Skeleton className="h-4 w-48" />
			</div>

			{/* 目标卡片网格骨架屏 */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
				{Array.from({ length: 8 }).map((_, index) => (
					<Card key={index} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<Skeleton className="h-6 w-3/4 mb-2" />
									<Skeleton className="h-4 w-full" />
								</div>
								<Skeleton className="h-8 w-8 rounded" />
							</div>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-4 w-20" />
								</div>
								<Skeleton className="h-4 w-32" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* 加载更多按钮骨架屏 */}
			<div className="text-center">
				<Skeleton className="h-10 w-32 mx-auto" />
			</div>
		</>
	)
} 