package data;

import haxe.io.Path;

class Page {
    public var visible:Bool = true;
    public var title:String;
    public var description:String;
    public var templatePath:Path;
    public var contentPath:Path;
    public var outputPath:Path;
    public var customData:Dynamic = {};
    public var tags:Array<String>;
    public var absoluteUrl:String;
    public var editUrl:String;
    public var addLinkUrl:String;
    public var contributionUrl:String;
    public var baseHref:String;
    //public var dates:GitDates;
    //public var category:data.Category;

    public function new(templatePath:String, contentPath:String, outputPath:String) {
        this.templatePath = new Path(templatePath);
        this.contentPath = contentPath != null ? new Path(contentPath) : null;
        this.outputPath = outputPath != null ? new Path(outputPath) : null;
    }


}