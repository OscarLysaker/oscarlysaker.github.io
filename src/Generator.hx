package;

import haxe.ds.StringMap;

import templo.Template;

import data.Page;

class Generator {
    
    public var contentPath = "./assets/content/";
	public var outputPath = "./output/";
	public var websiteRepositoryUrl = "";
	public var projectRepositoryUrl = "";
	public var repositoryBranch = "";
	public var basePath = "";
	public var titlePostFix = "";
	public var samplesFolder = "assets/includes/samples/";
	public var documentationFolder = "documentation/";
	public var assetsFolderName = "assets";

	private var _pages:Array<Page> = new Array<Page>();
	private var _folders:StringMap<Array<Page>> = new StringMap<Array<Page>>();
	private var _templates:StringMap<Template> = new StringMap<Template>();

    public function new() {}

    public function build() {
        trace("Build called...");

		initTemplate();

		addGeneralPages();
    }

	function addPage(page:Page, folder:String=null) {

		_pages.push(page);
		
		page.absoluteUrl = getAbsoluteUrl(page);
		page.baseHref = getBaseHref(page);
		
		if (page.contentPath != null) {
			//page.dates = util.GitUtil.getStat(contentPath + page.contentPath);
			page.contributionUrl = getContributionUrl(page);
			page.editUrl = getEditUrl(page);
		}
		
		if (folder != null) {
			if (!_folders.exists(folder)) {
				_folders.set(folder, []);
			}
			_folders.get(folder).push(page);
		}
	}

	function addGeneralPages() {
		var homePage = new Page("layout-page-main.mtt", "index.mtt", "index.html");

		var aboutPage = new Page("layout-page.mtt", "about.mtt", "about.html");

		var errorPage = new Page("layout-page-main.mtt", "404.mtt", "404.html");

		addPage(homePage, "/home");
		addPage(aboutPage, "/about");
		addPage(errorPage, "/404");

		errorPage.baseHref = "/";
	}

	private function getBaseHref(page:Page) {
		if (page.outputPath.file == "404.html") {
			return basePath;
		}
		var href = [for (s in page.outputPath.toString().split("/")) ".."];
		href[0] = ".";
		return href.join("/");
	}

	public inline function getEditUrl(page:Page) {
		return '${websiteRepositoryUrl}edit/${repositoryBranch}/${contentPath}${page.contentPath}';
	}
	
	public inline function getContributionUrl(page:Page) {
		return '${websiteRepositoryUrl}tree/${repositoryBranch}/${contentPath}${page.contentPath}';
	}

	public inline function getAbsoluteUrl(page:Page) {
		return basePath + page.outputPath.toString();
	}

    private function initTemplate() {
		// for some reason this is needed, otherwise templates doesn't work.
		// the function fails, but i think internally Template can resolve paths now.
		try { 
			Template.fromFile(contentPath + "layout-main.mtt").execute({});
		} catch (e:Dynamic) { trace("template failed");}
	}
}