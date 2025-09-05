<?php

namespace App\Http\Controllers;

use App\Http\Resources\SemproCollection;
use App\Models\Sempro;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemproController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $sempro = new SemproCollection(Sempro::paginate(8));
        return Inertia::render('Homepage', [
            'title' => "SEMPRO INI",
            'description' => "DUAR",
            'sempro' => $sempro,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $sempro = new Sempro();
        $sempro->title = $request->title;
        $sempro->description = $request->description;
        $sempro->category = $request->category;
        $sempro->author = auth()->user()->email;
        $sempro->save();
        return redirect()->back()->with('message', 'ini sudah benar');
        
        
    }
    
    
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function show(Sempro $sempro)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function edit(Sempro $sempro)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Sempro $sempro)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Sempro  $sempro
     * @return \Illuminate\Http\Response
     */
    public function destroy(Sempro $sempro)
    {
        //
    }
}
