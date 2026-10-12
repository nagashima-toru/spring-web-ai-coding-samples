package com.example.web.sample;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;

/** レイヤ・機能間の依存方向（docs/architecture.md）を機械的に検査する。 */
@AnalyzeClasses(packages = "com.example.web.sample", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    void ドメイン層は外側の層に依存しない(JavaClasses classes) {
        noClasses()
                .that().resideInAPackage("..domain..")
                .should().dependOnClassesThat()
                .resideInAnyPackage("..application..", "..infrastructure..", "..presentation..", "..generated..")
                .check(classes);
    }

    @ArchTest
    void アプリケーション層はインフラ層とプレゼンテーション層に依存しない(JavaClasses classes) {
        noClasses()
                .that().resideInAPackage("..application..")
                .should().dependOnClassesThat()
                .resideInAnyPackage("..infrastructure..", "..presentation..", "..generated..")
                .check(classes);
    }

    @ArchTest
    void プレゼンテーション層はインフラ層に依存しない(JavaClasses classes) {
        noClasses()
                .that().resideInAPackage("..presentation..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
                .check(classes);
    }

    @ArchTest
    void 生成コードはプレゼンテーション層からだけ使う(JavaClasses classes) {
        noClasses()
                .that().resideOutsideOfPackages("..presentation..", "..generated..")
                .should().dependOnClassesThat().resideInAPackage("..generated..")
                .check(classes);
    }

    @ArchTest
    void メッセージ機能は認証機能に依存しない(JavaClasses classes) {
        noClasses()
                .that().resideInAPackage("..sample.message..")
                .should().dependOnClassesThat().resideInAPackage("..sample.auth..")
                .check(classes);
    }

    @ArchTest
    void 認証機能はメッセージ機能に依存しない(JavaClasses classes) {
        noClasses()
                .that().resideInAPackage("..sample.auth..")
                .should().dependOnClassesThat().resideInAPackage("..sample.message..")
                .check(classes);
    }
}
