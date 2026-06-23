import { Injectable } from '@angular/core';
import { ISagaRequestDto } from './ISagaRequestDto';
import { ISagaResponseDto } from './ISagaResponseDto';
import { ISagaVersionRequestDto } from './ISagaVersionRequestDto';
import { ISagaVersionResponseDto } from './ISagaVersionResponseDto';
import { ISagaVersionVm } from './ISagaVersionVm';
import { IBibVm } from '../../bib/common/IBibVm';
import { BibMapper } from '../../bib/common/bib.mapper';
import { ISagaVm } from './ISagaVm';

@Injectable({
  providedIn: 'root',
})
export class SagaMapper {
  constructor(private bibMapper: BibMapper){}

  mapSagaResponseDtoToVm(dto: ISagaResponseDto): ISagaVm {

    var bibVms: IBibVm[] = [];

    //Map bib DTOs to bib VMs
    if (dto.bibDto){
      dto.bibDto.forEach(bibDto => {
        bibVms.push(this.bibMapper.mapDtoToVm(bibDto));
      });
    }

    bibVms.sort((a, b) => a.bibliographyEntry.localeCompare(b.bibliographyEntry));


    //Map saga version DTOs to saga version VMs
    var sagaVersionVms: ISagaVersionVm[] = [];

    if (dto.sagaVersions){
      dto.sagaVersions.forEach(sagaVersionDto => {
        sagaVersionVms.push(this.mapSagaVersionResponseDtoToVm(sagaVersionDto));
      });
    }

    sagaVersionVms.sort((a, b) => a.title.localeCompare(b.title));

    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      translated: dto.translated,
      sagaVersions: sagaVersionVms,
      bibIds: bibVms.flatMap(bib => bib.id),
      primarySources: bibVms.filter(bib => bib.primarySource == true),
      secondarySources: bibVms.filter(bib => bib.primarySource == false)
    }
  }

  mapSagaVmToRequestDto(vm: ISagaVm): ISagaRequestDto {

    const sagaVersionRequestDtos: ISagaVersionRequestDto[] = [];

    vm.sagaVersions.forEach(version => 
      sagaVersionRequestDtos.push(this.mapSagaVersionVmToRequestDto(version)));

    return {
      id: vm.id,
      title: vm.title,
      description: vm.description,
      translated: vm.translated,
      sagaVersions: sagaVersionRequestDtos,
      bibIds: vm.bibIds
    } 
  }

  mapSagaVersionVmToRequestDto(vm: ISagaVersionVm): ISagaVersionRequestDto {

    return {
      id: vm.id,
      title: vm.title,
      description: vm.description,
      date: vm.date,
      sagaId: vm.sagaId,
      personIds: [],
      placeIds: [],
      objectIds: [],
      msIds: []
    }
  }
  
  mapSagaVersionResponseDtoToVm(dto: ISagaVersionResponseDto): ISagaVersionVm {

    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      date: dto.date,
      sagaId: dto.sagaId,
      sagaMotifs: dto.sagaMotifs
    };
  }
}
