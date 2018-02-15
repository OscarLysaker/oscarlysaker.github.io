package;

class Main {

    public static function main() {

        trace("Hello world!");
        
        var generator:Generator = new Generator();
        generator.titlePostFix = " - Heaps.io Game Engine";
        generator.basePath = "http://heaps.io/";
        generator.websiteRepositoryUrl = "https://github.com/HeapsIO/heaps.io/";
        generator.projectRepositoryUrl = "https://github.com/HeapsIO/heaps/";
        generator.repositoryBranch = "master";

        generator.build();

    }
}