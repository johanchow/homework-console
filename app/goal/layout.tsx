export default function GoalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">学习目标</h1>
          <p className="mt-2 text-gray-600">管理您的学习目标，跟踪学习进度</p>
        </div>
        
        {children}
      </div>
    </div>
  )
}
