// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

export const projectsData: Project[] = [
	{
		id: "parkguard",
		title: "ParkGuard",
		description:
			"车辆挪车联系平台，包含微信小程序、Go API、通知 Worker 和 Svelte 管理台，串联用户联系流程与后台服务。",
		image: "",
		category: "mobile",
		techStack: ["Go", "微信小程序", "PostgreSQL", "Redis", "Svelte"],
		status: "in-progress",
		sourceCode: "https://github.com/zpooi/ParkGuard",
		startDate: "2026-09-15",
		featured: true,
		tags: ["小程序", "Go", "全栈"],
		showImage: false,
	},
	{
		id: "proxyforge",
		title: "ProxyForge",
		description:
			"使用 Go 构建的代理网关，整合管理页面、代理转发与 WARP MASQUE 出口选择，探索网关配置和网络隧道管理。",
		image: "",
		category: "web",
		techStack: ["Go", "代理网关", "WARP", "MASQUE"],
		status: "in-progress",
		sourceCode: "https://github.com/zpooi/ProxyForge",
		startDate: "2026-07-07",
		featured: true,
		tags: ["Go", "网络", "代理"],
		showImage: false,
	},
	{
		id: "ql-scripts",
		title: "青龙自动化脚本",
		description:
			"一组用于青龙面板的 Python 定时脚本，包含开奖数据获取、历史结果核对与通知流程，实践自动化和数据处理。",
		image: "",
		category: "other",
		techStack: ["Python", "青龙面板", "自动化", "数据处理"],
		status: "in-progress",
		sourceCode: "https://github.com/zpooi/ql_scripts",
		startDate: "2026-06-20",
		tags: ["Python", "脚本", "自动化"],
		showImage: false,
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
