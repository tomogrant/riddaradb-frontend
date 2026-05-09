import { Injectable } from "@angular/core";
import { IBib, PublicationType } from "./IBib";
import { IBibVm } from "./IBibVm";

@Injectable({
  providedIn: 'root',
})

export class BibMapper{

    stringBuilder(stringToBuild: string, stringToAdd: string){
        return (stringToBuild = (stringToBuild + stringToAdd));

    }

    mapDtoToVm(dto: IBib): IBibVm{

        var vm: IBibVm = {
            id: dto.id,
            publicationType: dto.publicationType,
            bibliographyEntry: ""
        }

        if (dto.publicationType === PublicationType.JOURNAL_ARTICLE){
            vm.bibliographyEntry = this.buildJournalArticle(dto);
        }

        return vm;
    }

    buildJournalArticle(dto: IBib){

        var str = "";

        if (dto.authors !== ''){
            if (dto.editors === '' && dto.translators === '') {this.stringBuilder(str, dto.authors + ". ");}
            else { {this.stringBuilder(str, dto.authors + ", ")} }
        }
        if (dto.editors !== ''){
            if (dto.authors !== '' && dto.translators === ''){this.stringBuilder(str, "ed. " + dto.editors + ". ");}
            else {this.stringBuilder(str, dto.editors + ", ed., ");}
        }

        if (dto.translators !== ''){
            if (dto.authors !== '' && dto.editors !== ''){this.stringBuilder(str, dto.translators + ", trans., ");}
            else { this.stringBuilder(str, "tr. " + dto.translators +". ");}
        }

        this.stringBuilder(str, "'" + dto.title + "', ");

        this.stringBuilder(str, "<i>" + dto.book + " </i>");

        if (dto.volume !== ''){this.stringBuilder(str, dto.volume + " ");}

        this.stringBuilder(str, "(" + dto.publicationYear + "), ");

        this.stringBuilder(str, dto.pageNumbers + ".");

        return str;
    }

    //     @if (dto.publicationType === PublicationType.JOURNAL_ARTICLE ){

    //       }

    //       <!--  BOOK CHAPTER -->
    //       @if (dto.publicationType === PublicationType.BOOK_CHAPTER ){
    //         @if (dto.authors !== ''){
    //           @if (dto.editors === '' && dto.translators === ''){<span>{{dto.authors}}. </span>}
    //           @else {<span>{{dto.authors}}, </span>}
    //         }
    //         @if (dto.editors !== ''){
    //           @if (dto.authors !== '' && dto.translators === ''){<span>ed. {{dto.editors}}. </span>}
    //           @else {<span>{{dto.editors}}, ed., </span>}
    //         }

    //         @if (dto.translators !== ''){
    //           @if (dto.authors !== '' && dto.editors !== ''){<span>{{dto.translators}}, trans., </span>}
    //           @else { <span>tr. {{dto.translators}}. </span> }
    //         }

    //         <span>'{{ dto.title }}', in </span>

    //         <span>{{dto.bookEditors}}, ed., </span>

    //         <span><i>{{ dto.book }}</i></span>

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}</span>}

    //         <span>. {{dto.placeOfPublication}}: </span>

    //         <span>{{ dto.publisher }}, </span>

    //         <span>{{dto.publicationYear}}, </span>

    //         @if (dto.pageNumbers.includes('-')){
    //           <span>pp. {{dto.pageNumbers}}.</span>
    //         }
    //         @else {
    //           <span>p. {{dto.pageNumbers}}.</span>
    //         }
    //       }

    //       <!-- EDITION -->
    //       @if (dto.publicationType === PublicationType.EDITION ){
    //         <span>{{dto.editors}}, ed. </span>

    //         <span><i>{{ dto.title }}</i></span>

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}</span>}

    //         @if (dto.numOfVolumes !== ''){
    //           @if (stringToInt(dto.numOfVolumes) > 1){
    //             <span>, {{dto.numOfVolumes}} vols.</span>
    //           }
    //           @else {
    //             <span>, {{dto.volume}} vol.</span>
    //           }
    //         }

    //         <span>. {{dto.placeOfPublication}}: </span>

    //         <span>{{ dto.publisher }}, </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!-- TRANSLATION -->
    //       @if (dto.publicationType === PublicationType.TRANSLATION ){

    //         <span>{{dto.translators}}, trans.</span>

    //         @if (dto.editors !== ''){
    //           <span>, ed. {{dto.editors}}.</span>
    //         }

    //         <span><i> {{ dto.title }}</i></span>

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}</span>}

    //         @if (dto.numOfVolumes !== ''){
    //           @if (stringToInt(dto.numOfVolumes) > 1){
    //             <span>, {{dto.numOfVolumes}} vols</span>
    //           }
    //           @else {
    //             <span>, {{dto.volume}} vol</span>
    //           }
    //         }

    //         <span>. {{dto.placeOfPublication}}: </span>

    //         <span>{{ dto.publisher }}, </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!-- MONOGRAPH -->
    //       @if (dto.publicationType === PublicationType.MONOGRAPH ){

    //         <span>{{dto.authors}}. </span>

    //         <span><i> {{ dto.title }}</i></span>

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}</span>}

    //         @if (dto.numOfVolumes !== ''){
    //           @if (stringToInt(dto.numOfVolumes) > 1){
    //             <span>, {{dto.numOfVolumes}} vols</span>
    //           }
    //           @else {
    //             <span>, {{dto.volume}} vol</span>
    //           }
    //         }

    //         <span>. {{dto.placeOfPublication}}: </span>

    //         <span>{{ dto.publisher }}, </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!-- EDITED COLLECTION -->
    //       @if (dto.publicationType === PublicationType.EDITED_COLLECTION ){
    //         <span>{{dto.editors}}, ed. </span>

    //         <span><i>{{ dto.title }}</i></span>

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}</span>}

    //         @if (dto.numOfVolumes !== ''){
    //           @if (stringToInt(dto.numOfVolumes) > 1){
    //             <span>, {{dto.numOfVolumes}} vols.</span>
    //           }
    //           @else {
    //             <span>, {{dto.numOfVolumes}} vol.</span>
    //           }
    //         }

    //         <span>. {{dto.placeOfPublication}}: </span>

    //         <span>{{ dto.publisher }}, </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!-- THESIS -->
    //       @if (dto.publicationType === PublicationType.THESIS ){
    //         <span>{{dto.authors}}. </span>

    //         <span>'{{ dto.title}}'. </span>

    //         <span>Unpubl. doctoral dissertation, </span>

    //         <span>{{dto.publisher}}, </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!-- WEBSITE -->
    //       @if (dto.publicationType === PublicationType.WEBSITE ){
    //         @if (dto.authors !== ''){<span>{{dto.authors}}. </span>}

    //         <span>{{dto.title}}. </span>

    //         <span><i><a href="{{dto.url}}">{{ dto.url }}</a>. </i></span>

    //         <span>Last accessed: </span>

    //         <span>{{dto.publicationYear}}.</span>
    //       }

    //       <!--  OTHER -->
    //       @if (dto.publicationType === PublicationType.OTHER ){
    //         @if (dto.authors !== ''){
    //           @if (dto.editors === '' && dto.translators === ''){<span>{{dto.authors}}. </span>}
    //           @else {<span>{{dto.authors}}, </span>}
    //         }
    //         @if (dto.editors !== ''){
    //           @if (dto.authors !== '' && dto.translators === ''){<span>ed. {{dto.editors}}. </span>}
    //           @else {<span>{{dto.editors}}, ed., </span>}
    //         }

    //         @if (dto.translators !== ''){
    //           @if (dto.authors !== '' && dto.editors !== ''){<span>{{dto.translators}}, trans., </span>}
    //           @else { <span>tr. {{dto.translators}}. </span> }
    //         }

    //         @if (dto.title !== ''){
    //           <span>'{{ dto.title }}'. </span>
    //         }

    //         @if (dto.url !== ''){
    //           <span><i><a href="{{dto.url}}">{{ dto.url }}</a>. </i></span>
    //         }

    //         @if (dto.bookEditors !== ''){
    //         <span>{{dto.bookEditors}}, ed., </span>
    //         }

    //         @if (dto.book){
    //         <span><i>{{ dto.book }}</i></span>
    //         }

    //         @if(dto.bookSeries !== ''){<span>. {{dto.bookSeries}}</span>}

    //         @if (dto.volume !== ''){<span> {{dto.volume}}, </span>}

    //         @if (dto.numOfVolumes !== ''){
    //           @if (stringToInt(dto.numOfVolumes) > 1){
    //             <span>{{dto.numOfVolumes}} vols.</span>
    //           }
    //           @else {
    //             <span>{{dto.numOfVolumes}} vol. </span>
    //           }
    //         }

    //         @if (dto.placeOfPublication){
    //         <span> {{dto.placeOfPublication}}: </span>
    //         }

    //         @if (dto.publisher !== ''){
    //         <span>{{ dto.publisher }}, </span>
    //         }


    //         @if (dto.publicationYear !== ''){
    //         <span>{{dto.publicationYear}}, </span>
    //         }

    //         @if (dto.pageNumbers !== ''){
    //           @if (dto.pageNumbers.includes('-')){
    //             <span>pp. {{dto.pageNumbers}}.</span>
    //           }
    //           @else {
    //             <span>p. {{dto.pageNumbers}}.</span>
    //           }
    //         }
    //       }
    //     }

    //     return vm;

    // }
    
}   